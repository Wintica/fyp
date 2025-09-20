// Firebase configuration using Modern Modular SDK 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Web app's Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyDo02EbpwpLA9If1bTNAbbGZm6dAU7EKK8",
  authDomain: "database-c8ff8.firebaseapp.com",
  projectId: "database-c8ff8",
  storageBucket: "database-c8ff8.firebasestorage.app",
  messagingSenderId: "422975069935",
  appId: "1:422975069935:web:2622077cfb949d1dfc451a",
  measurementId: "G-58S4WVJ7MQ",
  databaseURL: "https://database-c8ff8-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };