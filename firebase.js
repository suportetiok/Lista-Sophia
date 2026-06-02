import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update, push, remove, get } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup,       
  GoogleAuthProvider,    
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7QQJ_c5wmd3GffLYDrQ3xG44LdXSApFg",
    authDomain: "lista-de-presentes-33c7f.firebaseapp.com",
    databaseURL: "https://lista-de-presentes-33c7f-default-rtdb.firebaseio.com",
    projectId: "lista-de-presentes-33c7f",
    storageBucket: "lista-de-presentes-33c7f.firebasestorage.app",
    messagingSenderId: "540439045540",
    appId: "1:540439045540:web:23587a2640c46784ab0d31"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

export { 
  db, auth, providerGoogle, 
  ref, onValue, set, update, push, remove, get, 
  signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged 
};
