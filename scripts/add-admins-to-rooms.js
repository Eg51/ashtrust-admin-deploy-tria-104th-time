// scripts/add-admins-to-rooms.js
//
// One-time migration: add every admin as a participant of every user room.
//
// Idempotent — safe to run repeatedly.
//
// Usage:
//   node scripts/add-admins-to-rooms.js                          # dry run, reads .env.local
//   node scripts/add-admins-to-rooms.js --apply                  # writes to .env.local DB
//   node scripts/add-admins-to-rooms.js --env=.env.production    # dry run against prod env
//   node scripts/add-admins-to-rooms.js --env=.env.production --apply
//
// Safety features:
//   • Prints masked URI + DB name before any write
//   • APPLY mode requires typing "yes" to proceed
//   • Dry run by default — no accidental writes
//   • Idempotent — running twice is harmless

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { MongoClient } = require('mongodb');

// ── Parse CLI flags ─────────────────────────────────────────────────────
const envArg = process.argv.find((a) => a.startsWith('--env='));
const envFile = envArg ? envArg.replace('--env=', '') : '.env.local';
const APPLY = process.argv.includes('--apply');

// ── Read the env file manually (no dotenv dependency) ──────────────────
const envPath = path.join(__dirname, '..', envFile);
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    });
} else {
  console.error(`❌ Env file not found: ${envPath}`);
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  if (!MONGODB_URI) {
    console.error(`❌ MONGODB_URI not found in ${envFile}`);
    process.exit(1);
  }

  // Mask the password for safe logging / pasting
  const maskedUri = MONGODB_URI.replace(
    /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/,
    '$1••••$3'
  );

  console.log('\n═══════════════════════════════════════════════════');
  console.log('⚠️  TARGET DATABASE — READ CAREFULLY');
  console.log('═══════════════════════════════════════════════════');
  console.log('Env file :', envFile);
  console.log('URI      :', maskedUri);
  console.log('DB name  : userRegistration');
  console.log('Mode     :', APPLY ? '✅ APPLY (will write)' : '🟡 DRY RUN (no writes)');
  console.log('═══════════════════════════════════════════════════\n');

  // In APPLY mode, require explicit typed confirmation
  if (APPLY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await new Promise((resolve) =>
      rl.question('Type "yes" to confirm writing to this database: ', (a) => {
        rl.close();
        resolve(a.trim().toLowerCase());
      })
    );
    if (answer !== 'yes') {
      console.log('\nAborted by user.');
      process.exit(0);
    }
    console.log('');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('userRegistration');
  const users = db.collection('users');
  const chats = db.collection('chats');

  // ── 1. Load all admins ────────────────────────────────────────────────
  const admins = await users
    .find({ role: 'admin' })
    .project({ _id: 1, displayName: 1, username: 1, firstName: 1, email: 1 })
    .toArray();

  console.log(`Found ${admins.length} admin(s):`);
  admins.forEach((a) =>
    console.log(
      '  •',
      a.displayName || a.username || a.firstName || a.email,
      '|',
      a._id.toString()
    )
  );

  if (admins.length === 0) {
    console.log('\nNo admins to migrate. Exiting.');
    await client.close();
    return;
  }

  const adminMap = admins.map((a) => ({
    userId: a._id.toString(),
    name: a.displayName || a.username || a.firstName || 'Admin',
  }));

  // ── 2. Scan every user room ──────────────────────────────────────────
  const rooms = await chats.find({ 'participants.role': 'user' }).toArray();
  console.log(`\nScanning ${rooms.length} user room(s)...\n`);

  let roomsTouched = 0;
  let adminsAdded = 0;

  for (const room of rooms) {
    const existingAdminIds = new Set(
      (room.participants || [])
        .filter((p) => p.role === 'admin')
        .map((p) => String(p.userId))
    );

    const missing = adminMap.filter((a) => !existingAdminIds.has(a.userId));
    if (missing.length === 0) continue;

    console.log(
      `  Room ${room._id.toString()} → adding ${missing.length} admin(s):`,
      missing.map((m) => m.name).join(', ')
    );

    if (APPLY) {
      const newParticipants = missing.map((a) => ({
        userId: a.userId,
        role: 'admin',
        name: a.name,
      }));

      const unreadInit = {};
      missing.forEach((a) => {
        unreadInit[`unreadCount.${a.userId}`] = 0;
      });

      await chats.updateOne(
        { _id: room._id },
        {
          $push: { participants: { $each: newParticipants } },
          $set: { ...unreadInit, updatedAt: new Date() },
        }
      );
    }

    roomsTouched += 1;
    adminsAdded += missing.length;
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`Rooms needing update : ${roomsTouched}`);
  console.log(`Admin slots to add   : ${adminsAdded}`);
  console.log(`Mode                 : ${APPLY ? '✅ APPLY (wrote changes)' : '🟡 DRY RUN'}`);
  console.log(`────────────────────────────────────`);

  if (!APPLY && roomsTouched > 0) {
    console.log(`\nTo write, rerun with:`);
    console.log(`  node scripts/add-admins-to-rooms.js${envArg ? ' ' + envArg : ''} --apply`);
  }

  await client.close();
})().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});