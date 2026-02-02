// // lib/firebase.ts
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//  apiKey: "AIzaSyCD1BUCFS1vot4YRAELXLoRLYggyAaKm1A",
//   authDomain: "the-building-mall.firebaseapp.com",
//   projectId: "the-building-mall",
//   storageBucket: "the-building-mall.firebasestorage.app",
//   messagingSenderId: "1057333562161",
//   appId: "1:1057333562161:web:ebd706ce939b272210be10",
//   measurementId: "G-7GX4X1LZ96"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCD1BUCFS1vot4YRAELXLoRLYggyAaKm1A",
  authDomain: "the-building-mall.firebaseapp.com",
  projectId: "the-building-mall",
  storageBucket: "the-building-mall.firebasestorage.app",
  messagingSenderId: "1057333562161",
  appId: "1:1057333562161:web:ebd706ce939b272210be10",
  measurementId: "G-7GX4X1LZ96"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
