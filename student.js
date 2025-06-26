import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, query, where, addDoc,
  doc, getDoc, serverTimestamp, deleteDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const departmentSelect = document.getElementById("departmentSelect");
const teacherSelect = document.getElementById("selectedTeacher");
const appointmentForm = document.getElementById("appointmentForm");

// Min datetime set
function setMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const localNow = now.toISOString().slice(0, 16);
  document.getElementById("appointmentTime").min = localNow;
}
setMinDateTime();

// Load departments
async function loadDepartments() {
  const querySnapshot = await getDocs(collection(db, "teachers"));
  const departments = new Set();
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.department) departments.add(data.department);
  });

  departmentSelect.innerHTML = `<option value="" disabled selected>Select Department</option>`;
  departments.forEach((dept) => {
    const option = document.createElement("option");
    option.value = dept;
    option.textContent = dept;
    departmentSelect.appendChild(option);
  });
}
loadDepartments();

// Department change
departmentSelect.addEventListener("change", async () => {
  const department = departmentSelect.value;
  teacherSelect.innerHTML = `<option value="" disabled selected>Select Teacher</option>`;
  teacherSelect.disabled = true;

  if (!department) return;

  const q = query(collection(db, "teachers"), where("department", "==", department));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const teacher = docSnap.data();
    const option = document.createElement("option");
    option.value = JSON.stringify({ name: teacher.name, email: teacher.email });
    option.textContent = `${teacher.name} (${teacher.email})`;
    teacherSelect.appendChild(option);
  });

  teacherSelect.disabled = false;
});

// Auth Check
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User profile not found.");
      window.location.href = "index.html";
      return;
    }

    const userData = userSnap.data();

    if (userData.role !== "student" || userData.status !== "approved") {
      alert("Access Denied: Your account is not approved yet.");
      window.location.href = "index.html";
      return;
    }

    loadAppointments(userData.email);

    appointmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const department = departmentSelect.value;
      const selectedTeacher = JSON.parse(teacherSelect.value);
      const teacher = selectedTeacher.name;
      const teacherEmail = selectedTeacher.email;
      const appointmentTime = document.getElementById("appointmentTime").value;
      const purpose = document.getElementById("purpose").value;

      try {
        await addDoc(collection(db, "appointments"), {
          studentName: userData.name,
          studentEmail: userData.email,
          department,
          teacher,
          teacherEmail,
          appointmentTime,
          purpose,
          createdAt: serverTimestamp(),
          status: "pending"
        });

        alert("Appointment booked successfully!");
        appointmentForm.reset();
        teacherSelect.disabled = true;
        loadAppointments(userData.email);
      } catch (err) {
        console.error("Error saving appointment:", err);
        alert("Failed to book appointment.");
      }
    });
  } else {
    alert("Not logged in.");
    window.location.href = "index.html";
  }
});

// Load appointments
function loadAppointments(studentEmail) {
  const appointmentsList = document.getElementById("appointmentsList");
  appointmentsList.innerHTML = "";

  const appointmentsRef = collection(db, "appointments");
  const q = query(appointmentsRef, where("studentEmail", "==", studentEmail));

  getDocs(q).then(querySnapshot => {
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const appointmentId = docSnap.id;

      const row = document.createElement("tr");
      if (data.status !== "Completed") {
        row.innerHTML = `
          <td>${data.department}</td>
          <td>${data.teacher}<br><small style="color: #777;">${data.teacherEmail || ''}</small></td>
          <td>${new Date(data.appointmentTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}</td>

          <td>${data.purpose}</td>
          <td>
            ${data.status === "approved"
              ? `<button class="updateBtn" data-id="${appointmentId}">Delete</button>`
              : `<span style="color:gray;">Pending</span>`}
          </td>
        `;
        appointmentsList.appendChild(row);
      }
    });

    document.querySelectorAll(".updateBtn").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        const confirmDelete = confirm("Are you sure you want to delete this appointment?");
        if (confirmDelete) {
          try {
            await deleteDoc(doc(db, "appointments", id));
            alert("Appointment deleted.");
            loadAppointments(studentEmail);
          } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete.");
          }
        }
      });
    });

  }).catch(error => {
    console.error("Error loading appointments:", error);
  });
}
