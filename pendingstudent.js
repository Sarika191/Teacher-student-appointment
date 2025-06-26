import { db } from './firebase-config.js';
import { collection, getDocs, updateDoc, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const pendingStudentList = document.getElementById("pendingStudentList");

async function fetchPendingStudents() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    pendingStudentList.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const student = docSnap.data();

      if (student.role === 'student') {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = student.email;

        const statusCell = document.createElement("td");
        const statusButton = document.createElement("button");

        statusButton.className = "updateBtn";

        if (student.status === "pending") {
          statusButton.textContent = "Pending";

          statusButton.addEventListener("click", async () => {
            const userId = docSnap.id;

            await updateDoc(doc(db, "users", userId), { status: "approved" });

            await setDoc(doc(db, "students", userId), {
              name: student.name,
              email: student.email,
              role: student.role,
              status: "approved"
            });
            alert(`${student.name} is approved successfully!`);
            fetchPendingStudents();
          });
        } else {
          statusButton.textContent = "Approved";
          statusButton.disabled = true;
        }

        statusCell.appendChild(statusButton);

        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(statusCell);
        pendingStudentList.appendChild(row);
      }
    });
  } catch (error) {
    console.error("Error fetching students:", error);
  }
}

fetchPendingStudents();
