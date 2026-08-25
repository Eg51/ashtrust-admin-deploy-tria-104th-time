// import { auth, db } from "@/app/components/firebase";
// import {
//   createUserWithEmailAndPassword,
//   updateProfile,
//   type User,
// } from "firebase/auth";
// import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

// export interface SignUpData {
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string; // Keep consistent with your form (you used "email" in the form)
//   phone: string;
//   password: string;
// }

// export class RegistrationError extends Error {
//   constructor(message: string, public code?: string) {
//     super(message);
//     this.name = "RegistrationError";
//   }
// }

// export async function registerUser(formData: SignUpData): Promise<User> {
//   const { email, password, firstName, lastName, username, phone } = formData;
//   const normalizedUsername = username.toLowerCase().trim();
//   const normalizedEmail = email.toLowerCase().trim();

//   try {
//     // 1. Create Auth user
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       normalizedEmail,
//       password
//     );
//     const user = userCredential.user;

//     // 2. Update Auth profile (so displayName exists for login fallback)
//     const displayName = `${firstName} ${lastName}`.trim();
//     await updateProfile(user, { displayName });

//     // 3. Save user profile to Firestore
//     const userData = {
//       firstName,
//       lastName,
//       username: normalizedUsername,
//       displayName,
//       email: normalizedEmail,
//       phone,
//       accountType: "personal",
//       isActive: true,
//       role: "user",
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     await setDoc(doc(db, "users", user.uid), userData);

//     // 4. Create username → UID mapping for login-by-username
//     await setDoc(doc(db, "usernames", normalizedUsername), {
//       uid: user.uid,
//       username: normalizedUsername,
//       accountType: "personal",
//       createdAt: serverTimestamp(),
//     });

//     return user;
//   } catch (error: unknown) {
//     const firebaseError = error as { code?: string; message?: string };

//     // Map Firebase errors to readable messages
//     switch (firebaseError.code) {
//       case "auth/email-already-in-use":
//         throw new RegistrationError("This email is already registered.", firebaseError.code);
//       case "auth/weak-password":
//         throw new RegistrationError("Password is too weak. Use at least 8 characters.", firebaseError.code);
//       case "auth/invalid-email":
//         throw new RegistrationError("Invalid email address.", firebaseError.code);
//       case "auth/network-request-failed":
//         throw new RegistrationError("Network error. Check your connection.", firebaseError.code);
//       default:
//         throw new RegistrationError(
//           firebaseError.message || "Registration failed. Please try again.",
//           firebaseError.code
//         );
//     }
//   }
// }

// export async function checkUsernameExists(username: string): Promise<boolean> {
//   const snap = await getDoc(doc(db, "usernames", username.toLowerCase().trim()));
//   return snap.exists();
// }