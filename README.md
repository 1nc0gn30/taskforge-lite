# 🧩 TaskForge Lite

> Microservices-based task manager built with Node.js, Vite (React), and Render deployments. No external DB — pure in-memory services for speed and simplicity.

---

## 🌐 Project Structure

taskforge-lite/ ├── client/ # Vite React frontend ├── gateway/ # API Gateway (Express) ├── services/ # Microservices (users, tasks, comments) ├── shared/ # Shared utils (logger, etc.)


---

## 🚀 Features

- In-memory data (no DB)
- Microservice architecture
- Full CRUD for users, tasks, comments
- Gateway routing via http-proxy-middleware
- Responsive UI with Material UI

---

## 📦 Getting Started

1. Clone the repo:
```bash
git clone https://github.com/yourusername/taskforge-lite.git
cd taskforge-lite

2. Install dependencies for each folder:

npm install --prefix client
npm install --prefix gateway
npm install --prefix services/users
npm install --prefix services/tasks
npm install --prefix services/comments

3. Start Services:

npm run dev:gateway
npm run dev:users
npm run dev:tasks
npm run dev:comments
npm run dev:client

🌍 Deployment

    Frontend: Netlify or Render Static Site

    Services: Render Web Services (1 per service)

    Gateway: Render Web Service (entrypoint)

Set proper .env variables on each Render service (e.g., USERS_SERVICE_URL, etc.)
✨ License

MIT — Free and Open Source Software


---

Anything else you want to add before we ship it?  
I can help you:
- Push to GitHub with a proper commit tree
- Create Render deploy buttons
- Add unit tests or swagger docs

Let me know how you want to polish it ✨
# taskforge-lite
