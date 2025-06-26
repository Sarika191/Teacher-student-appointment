// teacher.js

import { auth, db } from './firebase-config.js';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Elements
const studentSelect = document.getElementById("studentSelect");
const scheduleForm = document.getElementById("scheduleForm");
const pendingList = document.getElementById("pendingAppointments");
const allList = document.getElementById("allAppointments");

let currentTeacher = null;

// Auth state handling
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      currentTeacher = docSnap.data();
      loadApprovedStudents();
      loadAppointmentsForTeacher();
    } else {
      alert("Teacher profile not found.");
    }
  } else {
    window.location.href = "index.html"; // redirect if not logged in
  }
});

// Load approved students into dropdown
async function loadApprovedStudents() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    where("status", "==", "approved")
  );

  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const option = document.createElement("option");
    option.value = data.email;
    option.textContent = `${data.name} (${data.email})`;
    option.setAttribute("data-name", data.name);
    studentSelect.appendChild(option);
  });
}

// Schedule form submit
scheduleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentTeacher) {
    alert("Please wait, teacher info is loading.");
    return;
  }

  const appointmentTime = document.getElementById("appointmentTime").value;
  const purpose = document.getElementById("purpose").value;
  const studentEmail = studentSelect.value;
  const studentName =
    studentSelect.options[studentSelect.selectedIndex].getAttribute("data-name");

  try {
    await addDoc(collection(db, "appointments"), {
      appointmentTime: appointmentTime,
      createdAt: Timestamp.now(),
      department: currentTeacher.department,
      purpose: purpose,
      studentEmail: studentEmail,
      studentName: studentName,
      teacher: currentTeacher.name,
      teacherEmail: currentTeacher.email,
      status: "pending",
      createdBy: "teacher"
    });

    alert("Appointment scheduled successfully!");
    scheduleForm.reset();
    loadAppointmentsForTeacher();
  } catch (err) {
    console.error("Error adding appointment:", err);
    alert("Something went wrong.");
  }
});

// Load appointments for this teacher
async function loadAppointmentsForTeacher() {
  const q = query(
    collection(db, "appointments"),
    where("teacher", "==", currentTeacher.name),
    where("teacherEmail", "==", currentTeacher.email)
  );

  const snapshot = await getDocs(q);

  pendingList.innerHTML = "";
  allList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    if (data.status === "pending" || data.status === "approved") {
      const row = createAppointmentRow(data, id, true);
      pendingList.appendChild(row);
    }

    const allRow = createAppointmentRow(data, id, false);
    allList.appendChild(allRow);
  });
}

// Create table row for appointments
function createAppointmentRow(data, id, withAction) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.studentName}</td>
    <td>${data.studentEmail}</td>
    <td>${data.purpose}</td>
    <td>${new Date(data.appointmentTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}</td>

    <td><span class="cell-content">${data.status}</span></td>
  `;

  const actionTd = document.createElement("td");

  if (withAction && data.status === "pending" && data.createdBy !== "teacher") {
    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve";
    approveBtn.className = "action-btn updateBtn";
    approveBtn.onclick = () => updateAppointmentStatus(id, "approved");
    actionTd.appendChild(approveBtn);
  }

  if (withAction && data.status !== "Completed") {
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.className = "action-btn updateBtn";
    completeBtn.onclick = () => updateAppointmentStatus(id, "Completed");
    actionTd.appendChild(completeBtn);
  }

  if (!withAction) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "action-btn deleteBtn";
    deleteBtn.onclick = () => deleteAppointment(id);
    actionTd.appendChild(deleteBtn);
  }

  row.appendChild(actionTd);
  return row;
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
  try {
    const ref = doc(db, "appointments", appointmentId);
    await updateDoc(ref, {
      status: status
    });
    alert(`Appointment marked as ${status}.`);
    loadAppointmentsForTeacher();
  } catch (err) {
    console.error("Error updating appointment:", err);
    alert("Failed to update appointment.");
  }
}

// Delete appointment
async function deleteAppointment(appointmentId) {
  if (confirm("Are you sure you want to delete this appointment?")) {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
      alert("Appointment deleted successfully.");
      loadAppointmentsForTeacher();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment.");
    }
  }
}

// Prevent past appointment time
function setMinAppointmentTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const localNow = now.toISOString().slice(0, 16);
  const appointmentInput = document.getElementById("appointmentTime");
  if (appointmentInput) {
    appointmentInput.min = localNow;
  }
}

window.addEventListener("DOMContentLoaded", setMinAppointmentTime);

// Logout function
window.logout = function () {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Could not logout.");
    });
};
