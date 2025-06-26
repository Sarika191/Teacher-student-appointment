import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { doc, setDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { logAction } from './log.js';

document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value.trim().toLowerCase(); // normalize role

  let department = "";
  let subject = "";

  if (role === 'teacher') {
    department = document.getElementById('department').value.trim();
    subject = document.getElementById('subject').value.trim();

    if (!department || !subject) {
      alert("Please fill department and subject for teacher.");
      return;
    }
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user.uid);

    // Build user data object
    const userData = {
      name: name,
      email: email,
      role: role
    };

    // Add extra fields depending on role
    if (role === 'teacher') {
      userData.department = department;
      userData.subject = subject;
    }

    if (role === 'student') {
      userData.status = 'pending'; // mark student as pending
    }

    // Store to users collection
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log("Data saved to 'users' collection");

    // Additionally store teacher data in teachers collection
    if (role === 'teacher') {
      await addDoc(collection(db, 'teachers'), {
        name: name,
        department: department,
        subject: subject
      });
      console.log("Data saved to 'teachers' collection");
    }

    alert(`Registration successful! Redirecting as ${role}...`);
    setTimeout(() => {
      if (role === 'student') window.location.href = 'student.html';
      else if (role === 'teacher') window.location.href = 'teacher.html';
      else if (role === 'admin') window.location.href = 'admin.html';
    }, 1000);

  } catch (error) {
    let errorMessage = "Registration failed!";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already in use.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address.";
    }

    logAction("REGISTER_FAILED", `Failed to register ${email}: ${error.message}`);
    alert(errorMessage);
  }
});
