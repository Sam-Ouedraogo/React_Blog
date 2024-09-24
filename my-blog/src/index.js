import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// these can go on github, they are public keys
const firebaseConfig = {
  apiKey: "AIzaSyDOkuWROKO3NafXcEqZ6j3ZnVjPudya60Q",
  authDomain: "react-blog-app-auth-6dd52.firebaseapp.com",
  projectId: "react-blog-app-auth-6dd52",
  storageBucket: "react-blog-app-auth-6dd52.appspot.com",
  messagingSenderId: "489699664660",
  appId: "1:489699664660:web:fad17bc66d69a6d9125801",
  measurementId: "G-8LWQHE3EF0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
