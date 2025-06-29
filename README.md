                                                                           🧑‍🏫 Teacher-Student Appointment System

A secure and user-friendly web application that allows students to book appointments with teachers in real-time. Built with Firebase for authentication and database management, this project streamlines the communication process in an academic setting.

🔗 Live Demo:  
👉 [https://teacher-student-appointment.netlify.app](https://teacher-student-appointment.netlify.app)

---

📌 Features

- 🔐 Secure Firebase Authentication
- 👨‍🎓 Separate user roles (Teacher & Student)
- 📅 Appointment booking and management
- 📊 Real-time updates with Firestore
- 📱 Responsive UI for all devices
- 🚫 Restricted access to non-authenticated users

---

 🛠️ Tech Stack
___________________________________________
| Technology | Purpose                    |
|------------|--------------------------- |
| HTML, CSS  | Frontend structure & style |
| JavaScript | Interactivity & logic      |
| Firebase   | Auth & Firestore backend   |
| Netlify    | Hosting                    |
___________________________________________
---

🔒 Firebase Security & API Safety

This project uses "public Firebase configuration" (as required for frontend apps). All operations are protected through:

- ✅ Authenticated access only
- 🔐 Firestore security rules (`request.auth != null`)
- 🌐 API Key domain restrictions(localhost & Netlify only)

> 💡 No private credentials are stored or exposed.
> Firebase keys are safe for frontend use when rules are properly implemented.

---

 📂 Folder Structure
student-teacher-appointment/
│
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── student.html
├── teacher.html
├── admin.html
│
├── css/
│   ├── base.css
│   ├── login.css
│
├── js/
│   ├── firebase-config.js
│   ├── login.js
│   ├── register.js
│   ├── forgot-password.js
│   ├── student.js
│   ├── teacher.js
│   ├── admin.js
│   ├── nointernet.js
│   └── log.js

__________________________________________________
🚀 How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Sarika191/Teacher-student-appointment/
