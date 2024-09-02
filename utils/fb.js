const { initializeApp } = require( 'firebase/app');
const { getAuth ,signOut , signInWithEmailAndPassword, createUserWithEmailAndPassword,browserSessionPersistence,setPersistence ,inMemoryPersistence} = require('firebase/auth')
const { getFirestore, collection, getDocs, setDoc,  getDoc ,doc,deleteDoc,  updateDoc  } = require('firebase/firestore/lite');


//firebase
const admin = require('firebase-admin')
const serviceAccount = require('../ServiceAccount.json');

const ref = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const firebaseConfig = {
  apiKey: "AIzaSyDDiYltnHvYB4W8pWRfZxOBY4h7OL7qFZE",
  authDomain: "okamoto--test.firebaseapp.com",
  databaseURL: "https://okamoto--test-default-rtdb.firebaseio.com",
  projectId: "okamoto--test",
  storageBucket: "okamoto--test.appspot.com",
  messagingSenderId: "252126464853",
  appId: "1:252126464853:web:b2634caedc946e541a7ddc"
};

const fb = initializeApp(firebaseConfig);
const db = getFirestore(fb);

module.exports = {ref, admin, collection, getDocs, setDoc,   getDoc ,doc,  updateDoc, deleteDoc , 
  db, getAuth, signOut , signInWithEmailAndPassword, createUserWithEmailAndPassword ,browserSessionPersistence,setPersistence,inMemoryPersistence};
