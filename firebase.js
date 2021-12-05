// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmheowGkJ-GBvpsZqUXnGF-J03_yRQVPI",
  authDomain: "twitter-build-ec18b.firebaseapp.com",
  projectId: "twitter-build-ec18b",
  storageBucket: "twitter-build-ec18b.appspot.com",
  messagingSenderId: "60221738342",
  appId: "1:60221738342:web:66b76f6165ddaf13a88ca7"
};

// Initialize Firebase
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export default app;
export { db, storage };