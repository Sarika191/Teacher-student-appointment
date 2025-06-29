// firebase-config.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDVCk3T9UENOynCBO4aBkzXBDypvZ3xgTI",
  authDomain: "student-teacher-appointm-1f44f.firebaseapp.com",
  projectId: "student-teacher-appointm-1f44f",
  storageBucket: "student-teacher-appointm-1f44f.appspot.com",
  messagingSenderId: "1038059644172",
  appId: "1:1038059644172:web:24a5a0858ea1879ee11529"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore instead of Realtime DB

export { app, auth, db };
