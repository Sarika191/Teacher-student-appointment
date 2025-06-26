import { db, auth } from './firebase-config.js';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import {
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

/* ------------------- CUSTOM CENTER ALERT ------------------- */
function showCustomAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-msg');
  alertMsg.textContent = message;
  alertBox.classList.remove('hidden');
}

function closeCustomAlert() {
  document.getElementById('custom-alert').classList.add('hidden');
}

/* ------------------- TEACHERS ------------------- */

const teacherForm = document.getElementById('addTeacherForm');
const teacherList = document.getElementById('teacherList');

teacherForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('teacherName').value.trim();
  const department = document.getElementById('department').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !department || !subject || !email || !password) {
    showCustomAlert("Please fill all fields.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await addDoc(collection(db, 'teachers'), {
      name,
      department,
      subject,
      email,
      uid: user.uid
    });

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role: "teacher",
      department,
      subject
    });

    showCustomAlert("Teacher added and account created.");
    teacherForm.reset();
    loadTeachers();

  } catch (err) {
    console.error("Error:", err);
    showCustomAlert("Failed to add teacher: " + err.message);
  }
});

async function loadTeachers() {
  teacherList.innerHTML = "";
  const snapshot = await getDocs(collection(db, 'teachers'));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="cell-content">${data.name}</div></td>
      <td><div class="cell-content">${data.department}</div></td>
      <td><div class="cell-content">${data.subject}</div></td>
      <td>
        <button class="deleteBtn" data-id="${docSnap.id}" data-uid="${data.uid || ''}">Delete</button>
        <button class="updateBtn" data-id="${docSnap.id}">Update</button>
      </td>
    `;
    teacherList.appendChild(row);
  });

  addTeacherEventListeners();
}

function addTeacherEventListeners() {
  document.querySelectorAll('.deleteBtn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const uid = button.dataset.uid;

      if (confirm("Are you sure you want to delete this teacher?")) {
        try {
          await deleteDoc(doc(db, 'teachers', id));
          if (uid) {
            await deleteDoc(doc(db, 'users', uid));
          }
          showCustomAlert("Teacher deleted.");
          loadTeachers();
        } catch (err) {
          console.error("Delete error:", err);
          showCustomAlert("Failed to delete teacher.");
        }
      }
    });
  });

  document.querySelectorAll('.updateBtn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const field = prompt("Which field you want to update? (name/department/subject)").toLowerCase();
      if (!['name', 'department', 'subject'].includes(field)) {
        showCustomAlert("Invalid field.");
        return;
      }
      const newValue = prompt(`Enter new value for ${field}:`);
      if (!newValue) {
        showCustomAlert("Value cannot be empty.");
        return;
      }
      try {
        await updateDoc(doc(db, 'teachers', id), { [field]: newValue });
        showCustomAlert("Updated successfully.");
        loadTeachers();
      } catch (err) {
        console.error("Update error:", err);
        showCustomAlert("Failed to update teacher.");
      }
    });
  });
}

loadTeachers();
