# 📝 Keeper App - AI-Powered Note Taking

A full-stack note-taking application with AI-powered features including automatic summarization, smart tagging, writing enhancement, and voice input.

## ✨ Features

- 🔐 **User Authentication** - JWT-based login/registration
- 📝 **Create, Edit, Delete Notes** - Full CRUD operations
- 📌 **Pin Notes** - Keep important notes at the top
- 🧠 **AI Summarization** - Automatically generate note summaries
- 🏷️ **Smart Tags** - AI-generated topic tags
- ✍️ **Writing Enhancement** - Improve grammar and clarity
- 💡 **Smart Suggestions** - Get title and content suggestions
- 🎤 **Voice Input** - Speech-to-text note creation
- 🔄 **Real-time Updates** - Instant UI updates

## 🛠️ Tech Stack

### Frontend
- React 19
- Redux Toolkit + RTK Query
- React Router DOM v7
- Material-UI Icons
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- OpenAI API (GPT-4o-mini)
- JWT Authentication
- bcryptjs for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/keeper-app.git
   cd keeper-app
Install backend dependencies

bash
npm install
Install frontend dependencies

bash
cd frontend
npm install
Set up environment variables

Create a .env file in the root directory.

Run the application

Backend:

bash
npm run dev
Frontend (in separate terminal):

bash
cd frontend
npm start
Open http://localhost:3000

📁 Project Structure
text
keeper-app/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── aiService.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── redux/
│   │   └── styles.css
│   └── package.json
├── .env
└── package.json
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
MIT

🙏 Acknowledgments
OpenAI for GPT-4o-mini API

Material-UI for components



---

