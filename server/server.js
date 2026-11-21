const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Support either DATABASE_URL (Railway, Render, Heroku) or individual parameters
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5434', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'schedule_management',
    };

const pool = new Pool(poolConfig);

// Auto-run schema migration on startup if running on cloud database
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          program VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          code VARCHAR(32) NOT NULL,
          title VARCHAR(255) NOT NULL,
          credits INT DEFAULT 3,
          color VARCHAR(32) DEFAULT '#3b82f6',
          instructor VARCHAR(255),
          location VARCHAR(255),
          notes TEXT
      );

      CREATE TABLE IF NOT EXISTS schedule_events (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          course_id VARCHAR(64) REFERENCES courses(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(32) NOT NULL,
          date DATE NOT NULL,
          start_time VARCHAR(8) NOT NULL,
          end_time VARCHAR(8) NOT NULL,
          day_of_week INT,
          is_recurring BOOLEAN DEFAULT FALSE,
          location VARCHAR(255),
          notes TEXT,
          study_session_id VARCHAR(64)
      );

      CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          course_id VARCHAR(64) REFERENCES courses(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(32) DEFAULT 'assignment',
          due_at TIMESTAMP WITH TIME ZONE NOT NULL,
          priority VARCHAR(16) DEFAULT 'medium',
          estimated_minutes INT DEFAULT 60,
          status VARCHAR(32) DEFAULT 'todo',
          notes TEXT
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          course_id VARCHAR(64) REFERENCES courses(id) ON DELETE SET NULL,
          topic VARCHAR(255) NOT NULL,
          study_type VARCHAR(32) DEFAULT 'learning',
          date DATE NOT NULL,
          start_time VARCHAR(8) NOT NULL,
          end_time VARCHAR(8) NOT NULL,
          duration_minutes INT DEFAULT 90,
          goal TEXT,
          status VARCHAR(32) DEFAULT 'planned',
          actual_duration_minutes INT DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS study_goals (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
          weekly_target_minutes INT DEFAULT 180,
          priority VARCHAR(16) DEFAULT 'medium',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS study_topics (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(32) DEFAULT 'not-started',
          priority VARCHAR(16) DEFAULT 'medium'
      );

      CREATE TABLE IF NOT EXISTS user_settings (
          user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          study_hours_start VARCHAR(8) DEFAULT '08:00',
          study_hours_end VARCHAR(8) DEFAULT '22:00',
          available_days JSONB DEFAULT '[1,2,3,4,5,6]',
          notifications_enabled BOOLEAN DEFAULT TRUE,
          theme VARCHAR(16) DEFAULT 'light',
          default_focus_duration INT DEFAULT 50,
          default_break_duration INT DEFAULT 10
      );

      -- Frehiwet Public Health account & curriculum
      INSERT INTO users (id, name, email, password_hash, program)
      VALUES ('usr_frehiwet', 'Frehiwet (Fre)', 'fre@gmail.com', '12345678F', 'Public Health (Year II, Sem I)')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name;

      INSERT INTO courses (id, user_id, code, title, credits, color, instructor, location, notes)
      VALUES
        ('c_anat_fre', 'usr_frehiwet', 'ANAT 201', 'Human Anatomy & Lab', 6, '#ef4444', 'Feredegn (0912462024) / Dr. Zerihun (0912462024)', 'Lecture Hall 1 / Anatomy Lab', 'Major foundational course.'),
        ('c_phys_fre', 'usr_frehiwet', 'PHYS 201', 'Human Physiology', 5, '#3b82f6', 'Zeleke (0910804000) / Haymanot (0924536903)', 'Lecture Hall 1', 'Systemic physiology and mechanisms.'),
        ('c_bioc_fre', 'usr_frehiwet', 'BIOC 201', 'Biochemistry', 3, '#10b981', 'Abebe (0938373278)', 'Science Hall 3', 'Metabolic pathways and enzyme kinetics.'),
        ('c_micr_fre', 'usr_frehiwet', 'MICR 201', 'Medical Microbiology & Lab', 3, '#8b5cf6', 'Demissew Shenikute (0923076091) / Gashaw Zewdie (0923660852)', 'Lab Room B', 'Bacteriology, virology, immunology.'),
        ('c_heco_fre', 'usr_frehiwet', 'HECON 201', 'Health Economics', 3, '#f59e0b', 'Haymanot (0921287073)', 'Hall 2', 'Health care financing and resource allocation.'),
        ('c_embr_fre', 'usr_frehiwet', 'EMBR 201', 'Embryology and Histology', 2, '#ec4899', 'Melaku (0924474001)', 'Histology Lab / Hall 1', 'Tissue micro-structure and organogenesis.'),
        ('c_ethi_fre', 'usr_frehiwet', 'ETHC 201', 'Health Ethics and Legal', 2, '#06b6d4', 'Dr. Desalegn (0910676657)', 'Hall 4', 'Bioethics and medical jurisprudence.'),
        ('c_incl_fre', 'usr_frehiwet', 'INCL 201', 'Inclusiveness', 2, '#64748b', 'Zenebe (0912152716)', 'Hall 2', 'Special needs and accessible healthcare.')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO schedule_events (id, user_id, course_id, title, type, date, start_time, end_time, day_of_week, is_recurring, location)
      VALUES
        ('ev_fre_m1', 'usr_frehiwet', 'c_anat_fre', 'Human Anatomy Lecture', 'class', CURRENT_DATE, '08:30', '10:20', 1, TRUE, 'Lecture Hall 1'),
        ('ev_fre_m2', 'usr_frehiwet', 'c_incl_fre', 'Inclusiveness Lecture', 'class', CURRENT_DATE, '10:30', '12:20', 1, TRUE, 'Hall 2'),
        ('ev_fre_m3', 'usr_frehiwet', 'c_embr_fre', 'Embryology and Histology', 'class', CURRENT_DATE, '13:30', '14:20', 1, TRUE, 'Histology Lab'),
        ('ev_fre_m4', 'usr_frehiwet', 'c_anat_fre', 'Anatomy Lab (G1 / G2)', 'lab', CURRENT_DATE, '15:20', '17:20', 1, TRUE, 'Anatomy Dissection Lab'),
        ('ev_fre_t1', 'usr_frehiwet', 'c_phys_fre', 'Human Physiology Lecture', 'class', CURRENT_DATE, '08:30', '10:20', 2, TRUE, 'Lecture Hall 1'),
        ('ev_fre_t2', 'usr_frehiwet', 'c_heco_fre', 'Health Economics Lecture', 'class', CURRENT_DATE, '10:30', '12:20', 2, TRUE, 'Hall 2'),
        ('ev_fre_t3', 'usr_frehiwet', 'c_micr_fre', 'Medical Microbiology Lecture', 'class', CURRENT_DATE, '13:30', '14:20', 2, TRUE, 'Hall 1'),
        ('ev_fre_t4', 'usr_frehiwet', 'c_anat_fre', 'Anatomy Lab (G1 / G2)', 'lab', CURRENT_DATE, '15:20', '17:20', 2, TRUE, 'Anatomy Lab'),
        ('ev_fre_w1', 'usr_frehiwet', 'c_bioc_fre', 'Biochemistry Lecture', 'class', CURRENT_DATE, '08:30', '10:20', 3, TRUE, 'Science Hall 3'),
        ('ev_fre_w2', 'usr_frehiwet', 'c_anat_fre', 'Human Anatomy Lecture', 'class', CURRENT_DATE, '10:30', '12:20', 3, TRUE, 'Lecture Hall 1'),
        ('ev_fre_w3', 'usr_frehiwet', 'c_micr_fre', 'Medical Microbiology Lecture', 'class', CURRENT_DATE, '13:30', '14:20', 3, TRUE, 'Hall 1'),
        ('ev_fre_w4', 'usr_frehiwet', 'c_anat_fre', 'Anatomy Lab (G1 / G2)', 'lab', CURRENT_DATE, '15:20', '17:20', 3, TRUE, 'Anatomy Lab'),
        ('ev_fre_th1', 'usr_frehiwet', 'c_phys_fre', 'Human Physiology Lecture', 'class', CURRENT_DATE, '08:30', '11:20', 4, TRUE, 'Lecture Hall 1'),
        ('ev_fre_th2', 'usr_frehiwet', 'c_embr_fre', 'Embryology and Histology', 'class', CURRENT_DATE, '13:30', '14:20', 4, TRUE, 'Histology Lab'),
        ('ev_fre_th3', 'usr_frehiwet', 'c_micr_fre', 'Microbiology Lab (G1 / G2)', 'lab', CURRENT_DATE, '15:20', '17:20', 4, TRUE, 'Microbiology Lab B'),
        ('ev_fre_f1', 'usr_frehiwet', 'c_bioc_fre', 'Biochemistry Lecture', 'class', CURRENT_DATE, '08:30', '09:20', 5, TRUE, 'Science Hall 3'),
        ('ev_fre_f2', 'usr_frehiwet', 'c_ethi_fre', 'Health Ethics and Legal', 'class', CURRENT_DATE, '09:30', '11:20', 5, TRUE, 'Hall 4'),
        ('ev_fre_f3', 'usr_frehiwet', 'c_heco_fre', 'Health Economics Lecture', 'class', CURRENT_DATE, '13:30', '14:20', 5, TRUE, 'Hall 2'),
        ('exam_fre_1', 'usr_frehiwet', 'c_incl_fre', 'Final Exam: Inclusiveness', 'exam', '2026-05-14', '09:00', '11:30', NULL, FALSE, 'Main Auditorium'),
        ('exam_fre_2', 'usr_frehiwet', 'c_embr_fre', 'Final Exam: Embryology and Histology', 'exam', '2026-05-16', '09:00', '11:30', NULL, FALSE, 'Medical Exam Center'),
        ('exam_fre_3', 'usr_frehiwet', 'c_anat_fre', 'Final Exam: Human Anatomy (Theory & Lab)', 'exam', '2026-05-18', '09:00', '12:00', NULL, FALSE, 'Anatomy Amphitheater'),
        ('exam_fre_4', 'usr_frehiwet', 'c_phys_fre', 'Final Exam: Human Physiology', 'exam', '2026-05-20', '09:00', '12:00', NULL, FALSE, 'Lecture Hall 1'),
        ('exam_fre_5', 'usr_frehiwet', 'c_micr_fre', 'Final Exam: Medical Microbiology', 'exam', '2026-05-22', '09:00', '11:30', NULL, FALSE, 'Medical Exam Center'),
        ('exam_fre_6', 'usr_frehiwet', 'c_bioc_fre', 'Final Exam: Biochemistry', 'exam', '2026-05-24', '09:00', '11:30', NULL, FALSE, 'Science Hall 3'),
        ('exam_fre_7', 'usr_frehiwet', 'c_heco_fre', 'Final Exam: Health Economics', 'exam', '2026-05-26', '09:00', '11:30', NULL, FALSE, 'Hall 2'),
        ('exam_fre_8', 'usr_frehiwet', 'c_ethi_fre', 'Final Exam: Health Ethics and Legal', 'exam', '2026-05-28', '09:00', '11:30', NULL, FALSE, 'Hall 4')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO tasks (id, user_id, course_id, title, type, due_at, priority, estimated_minutes, status)
      VALUES
        ('t_fre_1', 'usr_frehiwet', 'c_anat_fre', 'Anatomy Lab Dissection Log: Forearm & Hand', 'assignment', CURRENT_TIMESTAMP + INTERVAL '1 day', 'high', 90, 'in-progress'),
        ('t_fre_2', 'usr_frehiwet', 'c_micr_fre', 'Microbiology Unknown Culture Gram Stain Report', 'assignment', CURRENT_TIMESTAMP + INTERVAL '2 days', 'high', 60, 'todo')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error during database initialization:', err.message);
  }
};

initDb();

// Default status route
app.get('/', (req, res) => {
  res.json({
    message: 'Schedule Management PostgreSQL Backend API is running.',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      syncSave: 'POST /api/sync/save',
      syncLoad: 'GET /api/sync/load/:userId'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, program } = req.body;
  try {
    const id = 'usr_' + Date.now();
    const query = `
      INSERT INTO users (id, name, email, password_hash, program)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, program, created_at;
    `;
    const result = await pool.query(query, [id, name, email, password, program || 'General']);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = result.rows[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        program: user.program,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Sync full user data to PostgreSQL
app.post('/api/sync/save', async (req, res) => {
  const { userId, courses, events, tasks, studySessions, studyGoals, studyTopics, settings } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Settings
    if (settings) {
      await client.query(`
        INSERT INTO user_settings (user_id, study_hours_start, study_hours_end, available_days, notifications_enabled, theme, default_focus_duration, default_break_duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) DO UPDATE SET
          study_hours_start = EXCLUDED.study_hours_start,
          study_hours_end = EXCLUDED.study_hours_end,
          available_days = EXCLUDED.available_days,
          notifications_enabled = EXCLUDED.notifications_enabled,
          theme = EXCLUDED.theme,
          default_focus_duration = EXCLUDED.default_focus_duration,
          default_break_duration = EXCLUDED.default_break_duration;
      `, [
        userId,
        settings.studyHoursStart || '08:00',
        settings.studyHoursEnd || '22:00',
        JSON.stringify(settings.availableDays || [1, 2, 3, 4, 5, 6]),
        settings.notificationsEnabled ?? true,
        settings.theme || 'light',
        settings.defaultFocusDuration || 50,
        settings.defaultBreakDuration || 10
      ]);
    }

    // 2. Clear & insert courses
    if (Array.isArray(courses)) {
      await client.query('DELETE FROM courses WHERE user_id = $1', [userId]);
      for (const c of courses) {
        await client.query(`
          INSERT INTO courses (id, user_id, code, title, credits, color, instructor, location, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [c.id, userId, c.code, c.title, c.credits, c.color, c.instructor, c.location, c.notes]);
      }
    }

    // 3. Clear & insert events
    if (Array.isArray(events)) {
      await client.query('DELETE FROM schedule_events WHERE user_id = $1', [userId]);
      for (const e of events) {
        await client.query(`
          INSERT INTO schedule_events (id, user_id, course_id, title, type, date, start_time, end_time, day_of_week, is_recurring, location, notes, study_session_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [e.id, userId, e.courseId || null, e.title, e.type, e.date, e.startTime, e.endTime, e.dayOfWeek, e.isRecurring ?? false, e.location, e.notes, e.studySessionId]);
      }
    }

    // 4. Tasks
    if (Array.isArray(tasks)) {
      await client.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
      for (const t of tasks) {
        await client.query(`
          INSERT INTO tasks (id, user_id, course_id, title, type, due_at, priority, estimated_minutes, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `, [t.id, userId, t.courseId || null, t.title, t.type, t.dueAt, t.priority, t.estimatedMinutes, t.status, t.notes]);
      }
    }

    // 5. Study Sessions
    if (Array.isArray(studySessions)) {
      await client.query('DELETE FROM study_sessions WHERE user_id = $1', [userId]);
      for (const s of studySessions) {
        await client.query(`
          INSERT INTO study_sessions (id, user_id, course_id, topic, study_type, date, start_time, end_time, duration_minutes, goal, status, actual_duration_minutes, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [s.id, userId, s.courseId, s.topic, s.studyType, s.date, s.startTime, s.endTime, s.durationMinutes, s.goal, s.status, s.actualDurationMinutes, s.notes]);
      }
    }

    // 6. Study Goals
    if (Array.isArray(studyGoals)) {
      await client.query('DELETE FROM study_goals WHERE user_id = $1', [userId]);
      for (const g of studyGoals) {
        await client.query(`
          INSERT INTO study_goals (id, user_id, course_id, weekly_target_minutes, priority)
          VALUES ($1, $2, $3, $4, $5);
        `, [g.id, userId, g.courseId, g.weeklyTargetMinutes, g.priority]);
      }
    }

    // 7. Study Topics
    if (Array.isArray(studyTopics)) {
      await client.query('DELETE FROM study_topics WHERE user_id = $1', [userId]);
      for (const tp of studyTopics) {
        await client.query(`
          INSERT INTO study_topics (id, user_id, course_id, title, description, status, priority)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [tp.id, userId, tp.courseId, tp.title, tp.description, tp.status, tp.priority]);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'All user data synchronized to PostgreSQL database' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// Fetch user data from PostgreSQL
app.get('/api/sync/load/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const coursesRes = await pool.query('SELECT * FROM courses WHERE user_id = $1', [userId]);
    const eventsRes = await pool.query('SELECT * FROM schedule_events WHERE user_id = $1', [userId]);
    const tasksRes = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    const sessionsRes = await pool.query('SELECT * FROM study_sessions WHERE user_id = $1', [userId]);
    const goalsRes = await pool.query('SELECT * FROM study_goals WHERE user_id = $1', [userId]);
    const topicsRes = await pool.query('SELECT * FROM study_topics WHERE user_id = $1', [userId]);
    const settingsRes = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      courses: coursesRes.rows,
      events: eventsRes.rows,
      tasks: tasksRes.rows,
      studySessions: sessionsRes.rows,
      studyGoals: goalsRes.rows,
      studyTopics: topicsRes.rows,
      settings: settingsRes.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Schedule Management PostgreSQL API running on port ${port}`);
});
