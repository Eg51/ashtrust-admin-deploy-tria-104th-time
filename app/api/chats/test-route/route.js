export async function GET() {
    return new Response('Test route works!', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }