
 // =====================================
 // PALCO LIVRE - CONEXÃO FIREBASE
 // =====================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Configuração do projeto Firebase
const firebaseConfig = {
    apiKey: "AiZaSyDTit2Iwop4R8ZRQytjk9-tzgsiOoEVoMw",
    authDomain: "palco-livre-329eb.firebaseapp.com",
    projectId: "palco-livre-329eb",
    storageBucket: "palco-livre-329eb.appspot.com",
    messagingSenderId: "1080167380185",
    appId: "1:1080167380185:web:3a96ce38776e6805687ac8"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };


