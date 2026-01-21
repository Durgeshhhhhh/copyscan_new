
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * ============================================================
 * REQUIRED: FIRESTORE INDEXES (CRITICAL)
 * ============================================================
 * The Universal Admin Vault requires "Collection Group" indexes.
 * Go to Firebase Console > Firestore > Indexes > Composite.
 * Click "Add Index" and enter these settings:
 * 
 * --- INDEX 1 (For Universal Vault) ---
 * Collection ID: documents
 * Field path: createdAt (Descending)
 * Query scope: Collection group
 * 
 * --- INDEX 2 (For Admin History) ---
 * Collection ID: scans
 * Field path: createdAt (Descending)
 * Query scope: Collection group
 * ============================================================
 * 
 * FIRESTORE SECURITY RULES:
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     function isAdmin() {
 *       return request.auth != null && 
 *         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
 *     }
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
 *       match /documents/{docId} { allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin()); }
 *       match /scans/{scanId} { allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin()); }
 *     }
 *     match /{path=**}/scans/{scanId} { allow read: if isAdmin(); }
 *     match /{path=**}/documents/{docId} { allow read: if isAdmin(); }
 *   }
 * }
 */

const firebaseConfig = {
  apiKey: "AIzaSyA_gsrf87XN8U9hw3_88J_yg35jJPpZ18E",
  authDomain: "copyscape-91586.firebaseapp.com",
  projectId: "copyscape-91586",
  storageBucket: "copyscape-91586.firebasestorage.app",
  messagingSenderId: "8411523720",
  appId: "1:8411523720:web:9fe6591f5e2cf522a30d3d",
  measurementId: "G-SGE5C9MDP2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
