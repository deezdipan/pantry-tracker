// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import  {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4TG0yAjcYaWw_2fGkVId1IrfKn0CGnZQ",
  authDomain: "pantryappheadstarter.firebaseapp.com",
  projectId: "pantryappheadstarter",
  storageBucket: "pantryappheadstarter.appspot.com",
  messagingSenderId: "491894828346",
  appId: "1:491894828346:web:286bbf96a2f515fe94b403"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};