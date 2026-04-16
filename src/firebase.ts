import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgEZrlvqTET0YrJ2V7G0cSHfyG2ne7WlU",
  authDomain: "clothes-945d3.firebaseapp.com",
  projectId: "clothes-945d3",
  storageBucket: "clothes-945d3.firebasestorage.app",
  messagingSenderId: "495036502034",
  appId: "1:495036502034:web:dc41b0ce86f1a2d0e948cb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
