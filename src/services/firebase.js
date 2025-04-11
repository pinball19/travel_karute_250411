// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyExample",
  authDomain: "travelkarute.firebaseapp.com",
  projectId: "travelkarute",
  storageBucket: "travelkarute.appspot.com",
  messagingSenderId: "635350270309",
  appId: "1:635350270309:web:2498d21f9f134defeda18c"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// オフライン対応のためのデータ永続化を無効化
// 永続化がフォームデータのリセット問題を引き起こす可能性があるため、一時的にコメントアウト
/*
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  console.warn("Firebase永続化エラー:", err);
}
*/

export { db };