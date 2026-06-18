/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer
} from 'firebase/firestore';
import { 
  INITIAL_USERS, 
  INITIAL_BRANCHES, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS,
  DEFAULT_QRIS_SVG 
} from './mockData';
import { User, Branch, Category, Product, Transaction } from './types';

// Web app's Firebase configuration
const firebaseConfig = {
  projectId: "triple-maxim-khnbb",
  appId: "1:14780751245:web:254571fa8cc4a4d86031c4",
  apiKey: "AIzaSyChttdTGTnRyO3ExEl8TUf5h1YV1BQN2dY",
  authDomain: "triple-maxim-khnbb.firebaseapp.com",
  databaseId: "ai-studio-d122bf24-5e99-4d19-9065-ce4edec6b541",
  storageBucket: "triple-maxim-khnbb.firebasestorage.app",
  messagingSenderId: "14780751245"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Helper to validate connection
export async function testConnection() {
  try {
    // Attempt a quick server-side read of a test connection doc
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
    console.log("Firebase Connection: Success");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    } else {
      console.log("Firebase connection established successfully.");
    }
  }
}

// Ensure the database is pre-seeded with our beautiful initial sample data if it's currently empty
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Check if users are empty
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log("Seeding users...");
      for (const user of INITIAL_USERS) {
        // Enforce lowercase login credentials
        const formattedUser = {
          ...user,
          username: user.username.toLowerCase(),
          email: user.email.toLowerCase(),
          password: '123' // default simple password
        };
        await setDoc(doc(db, 'users', user.id), formattedUser);
      }
    }

    // 2. Check if branches are empty
    const branchesSnap = await getDocs(collection(db, 'branches'));
    if (branchesSnap.empty) {
      console.log("Seeding branches...");
      for (const branch of INITIAL_BRANCHES) {
        await setDoc(doc(db, 'branches', branch.id), branch);
      }
    }

    // 3. Check if categories empty
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    if (categoriesSnap.empty) {
      console.log("Seeding categories...");
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // 4. Check if products empty
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log("Seeding products...");
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    // 5. Check if settings/qris empty
    const qrisDoc = await getDoc(doc(db, 'settings', 'qris'));
    if (!qrisDoc.exists()) {
      await setDoc(doc(db, 'settings', 'qris'), { value: DEFAULT_QRIS_SVG });
    }
  } catch (err) {
    console.error("Error during database seeding:", err);
  }
}
