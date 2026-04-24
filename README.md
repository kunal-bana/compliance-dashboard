# Compliance Dashboard

A full-stack Compliance Management System with role-based access control.

---

## 📁 Project Structure

```
compliance-dashboard/
│
├── backend/        # Node.js + Express + MongoDB
├── frontend/       # React + Vite + TypeScript
```

---

## 🚀 Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* RTK 

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

---

## 🔐 Features

* Role-based access (ADMIN, MANAGER, VIEWER)
* Entity Management
* Regulation Management
* Task Tracking
* Authentication & Authorization
* Secure API with JWT

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/kunal-bana/compliance-dashboard.git
cd compliance-dashboard
```

---

### 2️⃣ Setup Backend

```
cd backend
npm install
```

Create `.env`:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

Run backend:

```
npm run dev
```

---

### 3️⃣ Setup Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🌐 API Base URL

```
http://localhost:5000/api
```

---

## 🧪 Testing (Optional)

```
npm install --save-dev @types/jest
```

---

## 📌 Notes

* First registered user becomes **ADMIN**
* All APIs are protected via JWT
* Role-based middleware controls access

---

## 🚀 Future Improvements

* Audit Logs
* Notifications
* File Upload (Cloudinary)
* Dashboard Analytics

---

## 👨‍💻 Author

Kunal Bana
