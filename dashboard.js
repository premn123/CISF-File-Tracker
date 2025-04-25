
// Firebase Config
var firebaseConfig = {
  apiKey: "AIzaSyAkP9unnCHDUGusBR7RCBanI8olWNh7rEg",
  authDomain: "cisf-file-tracker.firebaseapp.com",
  projectId: "cisf-file-tracker",
  storageBucket: "cisf-file-tracker.appspot.com",
  messagingSenderId: "485826204538",
  appId: "1:485826204538:web:41a7d1f9e419768f247cc3"
};

firebase.initializeApp(firebaseConfig);
let currentUserRoll = "";
const auth = firebase.auth();
const db = firebase.firestore();
let currentSnapshot = null;
let selectedSection = "all";

// Submit File Entry
function submitFileEntry() {
  const fileName = document.getElementById("file-name").value;
  const from = document.getElementById("from-section").value;
  const to = document.getElementById("to-section").value;
  const remarks = document.getElementById("remarks").value;

  if (!fileName || !from || !to) {
    alert("File Name, From and To fields are required!");
    return;
  }

  db.collection("file_movements").add({
    fileName,
    from,
    to,
    remarks,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    status: "pending"
  }).then(() => {
    alert("File movement submitted!");
    document.getElementById("file-name").value = "";
    document.getElementById("from-section").value = "";
    document.getElementById("to-section").value = "";
    document.getElementById("remarks").value = "";
  }).catch((error) => {
    alert("Error: " + error.message);
  });
}

// Mark file as signed
function markSigned(docId) {
  db.collection("file_movements").doc(docId).update({
    status: "signed"
  }).then(() => {
    alert("Marked as signed");
  }).catch((error) => {
    alert("Error: " + error.message);
  });
}

// Render movement table
function renderMovementTable(snapshot) {
  const tableBody = document.getElementById("movement-table-body");
  const pendingList = document.getElementById("pending-files");
  const now = new Date();

  tableBody.innerHTML = "";
  pendingList.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const time = new Date(data.timestamp?.seconds * 1000);

    if (selectedSection === "all" || data.to === selectedSection || data.from === selectedSection) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.fileName}</td>
        <td>${data.from}</td>
        <td>${data.to}</td>
        <td>${time.toLocaleString()}</td>
        <td style="color: ${data.status === 'signed' ? 'green' : 'red'}">${data.status}</td>
        <td>${
  data.status === 'pending' && currentUserRole === 'officer'
    ? `<button onclick="markSigned('${doc.id}')">Mark as Signed</button>`
    : '—'
}</td>

      `;
      tableBody.appendChild(row);

      if ((now - time) > 86400000 && data.status === "pending") {
        const pendingLi = document.createElement("li");
        pendingLi.style.color = "red";
        pendingLi.textContent = `PENDING - File: ${data.fileName} (From: ${data.from} to ${data.to}) since ${time.toLocaleString()}`;
        pendingList.appendChild(pendingLi);
      }
    }
  });
}

// Initialize page and fetch data
window.onload = function () {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      db.collection("users").doc(user.uid).get().then(doc => {
        if (doc.exists) {
          currentUserRole = doc.data().role;
          console.log("Logged-in Role:", currentUserRole);
          startDashboard();  // Start loading data after role is fetched
        }
      });
    }
  });
};
function startDashboard() {
  const sectionFilter = document.getElementById("section-filter");

  db.collection("file_movements").orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
      currentSnapshot = snapshot;
      renderMovementTable(snapshot);
    });

  sectionFilter.addEventListener("change", () => {
    selectedSection = sectionFilter.value;
    if (currentSnapshot) {
      renderMovementTable(currentSnapshot);
    }
  });
}

