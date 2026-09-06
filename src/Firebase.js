import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// פרטי הפרויקט שלך ב-Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBFOWDI9nBlxMgtygpteVvyq_6jPnRBd3I",
  authDomain: "zviacampaign.firebaseapp.com",
  projectId: "zviacampaign",
  storageBucket: "zviacampaign.firebasestorage.app",
  messagingSenderId: "211825120979",
  appId: "1:211825120979:web:3991f7179db2740aa7a626",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
