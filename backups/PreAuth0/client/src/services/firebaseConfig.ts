import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPArIBroqTGQA6lCX-FP4PdrP-tAVSxYY",
  authDomain: "paddock20-chat-platform.firebaseapp.com",
  projectId: "paddock20-chat-platform",
  storageBucket: "paddock20-chat-platform.firebasestorage.app",
  messagingSenderId: "210925460670",
  appId: "1:210925460670:web:cee387cfc01bf98d5f52ef",
  measurementId: "G-K0H33FL3DK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let analytics: any = null;

// Initialize analytics only in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { db, analytics };