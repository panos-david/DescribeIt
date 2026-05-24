import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCGBtELi1dOOYNIA1zvH83uz_Qn0vtQJ50",
  authDomain: "describeit-92f2f.firebaseapp.com",
  databaseURL: "https://describeit-92f2f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "describeit-92f2f",
  storageBucket: "describeit-92f2f.firebasestorage.app",
  messagingSenderId: "392334161060",
  appId: "1:392334161060:web:396bd48a946ce07bbfe231",
  measurementId: "G-JQFGRLMDWT"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
