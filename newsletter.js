async function subscribe() {
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
    status.textContent = "Subscription failed. Please try again.";
  }
}
