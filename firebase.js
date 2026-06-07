// Importa todas as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    set, 
    update, 
    push, 
    remove, 
    get, 
    child 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// ✅ SUAS CREDENCIAIS DO PROJETO lista-sophia
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

// Serviços que usamos no sistema
const db = getDatabase(app);
const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

// ✅ Exporta TUDO o que o app.js precisa
export { 
    db, 
    auth, 
    providerGoogle, 
    ref, 
    onValue, 
    set, 
    update, 
    push, 
    remove, 
    get, 
    child,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
};
