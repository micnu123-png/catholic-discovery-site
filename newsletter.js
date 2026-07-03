import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyCWQC1tU9HyyrQhNVt3t3Ep1rhtzYmobMQ",
  authDomain: "catholic-discovery-websi-af85b.firebaseapp.com",
  projectId: "catholic-discovery-websi-af85b",
  storageBucket: "catholic-discovery-websi-af85b.firebasestorage.app",
  messagingSenderId: "981649696506",
  appId: "1:981649696506:web:06ecfceeee7fb90bb50b43",
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= SUBSCRIBE FUNCTION =================
window.subscribe = async function () {
  const name = document.getElementById("subscriberName").value.trim();
  const email = document.getElementById("subscriberEmail").value.trim();
  const status = document.getElementById("subscribeStatus");

  if (!email) {
    status.textContent = "Please enter your email.";
    return;
  }

  try {
    await addDoc(collection(db, "subscribers"), {
      name,
      email,
      subscribedAt: serverTimestamp()
    });

    status.textContent = "Thank you for subscribing!";
    document.getElementById("subscriberName").value = "";
    document.getElementById("subscriberEmail").value = "";

  } catch (err) {
    console.error(err);
    status.textContent = "Subscription failed. Check Firebase rules.";
  }
};
