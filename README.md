# Schedule Management System (Full Stack)

Academic schedule, timetable, task, and study planning platform with multi-user authentication, PostgreSQL persistence via Docker, and responsive UI.

---

## 🏗️ Architecture & Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, `date-fns`.
- **Database**: PostgreSQL 16 (running via Docker on port `5434`).
- **Backend API**: Node.js / Express with `pg` connection pool.
- **Data Persistence**: Real PostgreSQL database with local offline fallback.

---

## 🚀 Running the System

### 1. Start the PostgreSQL Database (Docker)
Ensure Docker Desktop is open and running, then:
```bash
docker compose up -d
```
This starts the `schedule_postgres` container on port `5434` and initializes the tables:
- `users`
- `courses`
- `schedule_events`
- `tasks`
- `study_sessions`
- `study_goals`
- `study_topics`
- `user_settings`

### 2. Start the Backend API
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Start the Frontend Application
In the root directory:
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Accounts

The PostgreSQL database comes pre-seeded with:

1. **🏥 Public Health Student Account**:
   - **Email**: `publichealth@university.edu`
   - **Password**: `demo123`
   - **Data**: Full 2nd Year Sem I Timetable, 8 Courses with instructor contacts, exam dates, and pre-allocated study blocks.

2. **💻 Alex (Computer Science Account)**:
   - **Email**: `alex@university.edu`
   - **Password**: `demo123`
   - **Data**: Algorithms, Linear Algebra, and Systems study schedule.

Or click **"Create Account"** to register a new account.
