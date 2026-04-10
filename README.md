# TaskManager

A full-stack task management application built with the MERN stack and TailwindCSS. Manage tasks, collaborate with teammates, and stay on top of deadlines — all with real-time email notifications.

**Live Demo:** https://guvitaskmanager.netlify.app  
**Backend API:** https://task-manager-backend-404g.onrender.com

---
Demo credential
---------------
email:- guvsundar@gmail.com
password:- Radnus@123
---------------

## Features

- **Task CRUD** — Create, update, and delete tasks with title, description, deadline, priority, status, and category
- **Task Assignment** — Assign tasks to other registered users
- **Task Sharing** — Share tasks with view-only or edit permissions
- **Threaded Comments** — Comment on tasks with nested replies
- **File Attachments** — Upload and attach files to tasks
- **Email Notifications** — Automated emails for:
  - Task assignment
  - Task sharing
  - Task field updates (title, description, deadline, priority, category)
  - Status changes
  - New comments
  - Deadline reminders (hourly cron check)
- **Dashboard** — Progress charts and task statistics using Recharts
- **JWT Authentication** — Secure login and registration
- **User Profile** — Update name, avatar, and notification preferences

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| TailwindCSS | Styling |
| Axios | HTTP client |
| React Hook Form | Form handling |
| Recharts | Dashboard charts |
| react-hot-toast | Notifications |
| date-fns | Date formatting |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| Multer | File uploads |
| Brevo SDK (`@getbrevo/brevo`) | Transactional email |
| node-cron | Scheduled deadline checks |
| express-validator | Request validation |

### Deployment
| Service | Purpose |
|---|---|
| Netlify | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |
| Brevo | Email delivery |

---

## Project Structure

```
TM/
├── frontend/               # React app (deployed on Netlify)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── tasks/      # TaskCard, TaskForm, TaskFilters
│   │   │   ├── layout/     # Navbar, Sidebar
│   │   │   └── common/     # Shared components
│   │   ├── pages/          # Route-level pages
│   │   │   ├── Dashboard.js
│   │   │   ├── Tasks.js
│   │   │   ├── TaskDetail.js
│   │   │   ├── Profile.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── services/
│   │   │   └── api.js      # Axios instance with interceptors
│   │   ├── context/        # Auth context
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── netlify.toml
│
└── backend/                # Express API (deployed on Render)
    ├── controllers/        # Route handlers
    │   ├── taskController.js
    │   ├── userController.js
    │   ├── commentController.js
    │   └── authController.js
    ├── models/             # Mongoose schemas
    │   ├── Task.js
    │   ├── User.js
    │   ├── Comment.js
    │   └── Notification.js
    ├── routes/             # Express routers
    ├── services/
    │   ├── emailService.js # Brevo email templates & sending
    │   └── cronService.js  # Deadline reminder cron job
    ├── middleware/         # Auth middleware
    ├── config/
    │   └── db.js           # MongoDB connection
    └── server.js
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Brevo account (free tier works)

### 1. Clone the repository

```bash
git clone <repo-url>
cd TM
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Brevo email (get API key from app.brevo.com → SMTP & API → API Keys)
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM=your_verified_sender_email@example.com

CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

Start the backend:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false
```

Start the frontend:

```bash
npm start
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (Render)

| Variable | Description |
|---|---|
| `PORT` | Server port (Render sets this automatically) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | Token expiry duration (e.g. `7d`) |
| `BREVO_API_KEY` | Brevo API key for sending emails |
| `BREVO_FROM` | Verified sender email address in Brevo |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `https://guvitaskmanager.netlify.app`) |

### Frontend (Netlify)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (e.g. `https://task-manager-backend-404g.onrender.com/api`) |
| `GENERATE_SOURCEMAP` | Set to `false` to reduce build size |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks for the logged-in user |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/:id` | Get a single task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/tasks/:id/assign` | Assign task to a user |
| POST | `/api/tasks/:id/share` | Share task with a user |
| POST | `/api/tasks/:id/attachments` | Upload file attachment |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/:taskId` | Get comments for a task |
| POST | `/api/comments/:taskId` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/search?q=name` | Search users by name or email |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile (name, avatar, settings) |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get all notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |

---
## License

MIT
