import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAt3aY2C9tXcvJnAhI71W7IQzo5nJnEj2w",
  authDomain: "dashboard-de8fb.firebaseapp.com",
  projectId: "dashboard-de8fb",
  storageBucket: "dashboard-de8fb.firebasestorage.app",
  messagingSenderId: "729276559955",
  appId: "1:729276559955:web:3cbc4497043e663897cca6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
