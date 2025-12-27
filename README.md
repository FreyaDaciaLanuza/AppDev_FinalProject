<div align="center">

# ✅ Task Manager App

A simple to-do task manager with user authentication.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## ✨ Features

| Feature           | Description                       |
| ----------------- | --------------------------------- |
| 🔐 Authentication | User registration and login       |
| 📝 Task CRUD      | Create, edit, and delete tasks    |
| 🎯 Priority       | Set low, medium, or high priority |
| 🏷️ Categories     | Organize tasks by category        |
| 🔍 Filter & Sort  | Find tasks quickly                |

---

## 🛠️ Tech Stack

| Layer        | Technologies                   |
| ------------ | ------------------------------ |
| **Backend**  | Node.js, Express, MongoDB, JWT |
| **Frontend** | HTML, CSS, JavaScript          |
| **Database** | MongoDB Atlas                  |
| **Hosting**  | Vercel                         |

---

## 📁 Project Structure

```
AppDev_FinalProject/
├── 📄 server.js           # Main Express server & MongoDB connection
├── 📄 api.js              # Vercel serverless function export
├── 📄 package.json        # Dependencies and scripts
├── 📄 vercel.json         # Vercel deployment configuration
├── 📄 Procfile            # Heroku deployment configuration
├── 📄 .env                # Environment variables (create this)
├── 📄 .gitignore          # Git ignore rules
│
├── 📂 models/
│   ├── 📄 User.js         # User schema (username, email, password)
│   └── 📄 Task.js         # Task schema (title, priority, category, dueDate)
│
├── 📂 routes/
│   ├── 📄 auth.js         # Authentication routes (register, login)
│   └── 📄 tasks.js        # Task CRUD routes (GET, POST, PUT, DELETE)
│
├── 📂 middleware/
│   └── 📄 auth.js         # JWT authentication middleware
│
└── 📂 public/
    ├── 📄 index.html      # Main HTML page
    ├── 📄 style.css       # Stylesheet
    └── 📄 script.js       # Frontend JavaScript logic
```

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file in root folder
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# 3. Run the app
npm start
```

🌐 Open **http://localhost:5000**

---

## 📡 API Endpoints

|  Method  | Endpoint           | Description   |
| :------: | ------------------ | ------------- |
|  `POST`  | /api/auth/register | Register user |
|  `POST`  | /api/auth/login    | Login user    |
|  `GET`   | /api/tasks         | Get all tasks |
|  `POST`  | /api/tasks         | Create task   |
|  `PUT`   | /api/tasks/:id     | Update task   |
| `DELETE` | /api/tasks/:id     | Delete task   |

---

## 👥 Team Members

| Name                     |
| ------------------------ |
| Freya Dacia Lanuza       |
| Loida Alagbate           |
| Pierre Lawrence Marbella |

---
