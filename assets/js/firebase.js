// ============================================================
// MILUZZA JOIAS — FIREBASE
// ============================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// CONFIGURAÇÃO DO PROJETO MILUZZA JOIAS
// ============================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyAwgumX1YaWrz31PQwneSAXsoxYXtmKr00",

  authDomain:
    "miluzza-joias-ca518.firebaseapp.com",

  projectId:
    "miluzza-joias-ca518",

  storageBucket:
    "miluzza-joias-ca518.firebasestorage.app",

  messagingSenderId:
    "695140285519",

  appId:
    "1:695140285519:web:718d322ccb9883580b7e3a"

};


// ============================================================
// INICIALIZAÇÃO
// ============================================================

const app =
  initializeApp(firebaseConfig);


const db =
  getFirestore(app);


const auth =
  getAuth(app);


// ============================================================
// PERSISTÊNCIA DA AUTENTICAÇÃO
// ============================================================
//
// A sessão fica somente enquanto a aba/sessão do navegador
// estiver ativa. Ao fechar o navegador, a autenticação não
// fica permanentemente armazenada.
// ============================================================

setPersistence(
  auth,
  browserSessionPersistence
).catch((error) => {

  console.error(
    "Erro ao configurar persistência:",
    error
  );

});


// ============================================================
// EXPORTAÇÕES
// ============================================================

export {

  db,

  auth,

  collection,

  getDocs,

  getDoc,

  doc,

  addDoc,

  updateDoc,

  deleteDoc,

  serverTimestamp,

  query,

  orderBy,

  signInWithEmailAndPassword,

  signOut,

  onAuthStateChanged,

  setPersistence,

  browserSessionPersistence

};