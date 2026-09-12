import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCdAVpYhcdurxJLnZmvesIEHsN3pBWquF8",
    authDomain: "crystal-wishlist.firebaseapp.com",
    projectId: "crystal-wishlist",
    storageBucket: "crystal-wishlist.firebasestorage.app",
    messagingSenderId: "383897040491",
    appId: "1:383897040491:web:4a67e7549a8ed75e1a232e",
    measurementId: "G-CRL695ERCJ"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
