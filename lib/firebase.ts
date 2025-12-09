import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA-nc1GqqAR6IpBBg4BhyE05s-6UkaEmpM",
    authDomain: "helpdeskpro-bf6fe.firebaseapp.com",
    databaseURL: "https://helpdeskpro-bf6fe-default-rtdb.firebaseio.com",
    projectId: "helpdeskpro-bf6fe",
    storageBucket: "helpdeskpro-bf6fe.firebasestorage.app",
    messagingSenderId: "386292102540",
    appId: "1:386292102540:web:efabb4855d598f0593d2a9",
    measurementId: "G-0SV7BXLZG2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
