import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdwDnwBSRFB6oY2mg7qsB9OLF2csw5hag",
  authDomain: "lista-sophia.firebaseapp.com",
  databaseURL: "https://lista-sophia-default-rtdb.firebaseio.com",
  projectId: "lista-sophia",
  storageBucket: "lista-sophia.firebasestorage.app",
  messagingSenderId: "10075688372",
  appId: "1:10075688372:web:c33674f2f8912e931376e1"
};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

export { 
  db, 
  auth, 
  providerGoogle, 
  getDatabase,
  getAuth,
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  ref, 
  onValue, 
  set, 
  update, 
  push, 
  remove, 
  get 
};

// Importações adicionais necessárias
import { ref, onValue, set, update, push, remove, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
