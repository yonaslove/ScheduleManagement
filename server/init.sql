-- PostgreSQL Database Initial Schema and Seed Data

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
    type VARCHAR(32) NOT NULL, -- class, lab, study, exam, personal
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

-- 1. Insert User Frehiwet into Database
INSERT INTO users (id, name, email, password_hash, program)
VALUES ('usr_frehiwet', 'Frehiwet (Fre)', 'fre@gmail.com', '12345678F', 'Public Health (Year II, Sem I)')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name;

-- 2. Insert Frehiwet's Courses into Database
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

-- 3. Insert Frehiwet's Schedule Events into Database
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

-- 4. Insert Frehiwet's Tasks into Database
INSERT INTO tasks (id, user_id, course_id, title, type, due_at, priority, estimated_minutes, status)
VALUES
  ('t_fre_1', 'usr_frehiwet', 'c_anat_fre', 'Anatomy Lab Dissection Log: Forearm & Hand', 'assignment', CURRENT_TIMESTAMP + INTERVAL '1 day', 'high', 90, 'in-progress'),
  ('t_fre_2', 'usr_frehiwet', 'c_micr_fre', 'Microbiology Unknown Culture Gram Stain Report', 'assignment', CURRENT_TIMESTAMP + INTERVAL '2 days', 'high', 60, 'todo')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Frehiwet's Study Goals into Database
INSERT INTO study_goals (id, user_id, course_id, weekly_target_minutes, priority)
VALUES
  ('sg_fre_anat', 'usr_frehiwet', 'c_anat_fre', 360, 'high'),
  ('sg_fre_phys', 'usr_frehiwet', 'c_phys_fre', 300, 'high'),
  ('sg_fre_bioc', 'usr_frehiwet', 'c_bioc_fre', 240, 'high'),
  ('sg_fre_micr', 'usr_frehiwet', 'c_micr_fre', 180, 'medium'),
  ('sg_fre_heco', 'usr_frehiwet', 'c_heco_fre', 180, 'medium'),
  ('sg_fre_embr', 'usr_frehiwet', 'c_embr_fre', 120, 'medium'),
  ('sg_fre_ethi', 'usr_frehiwet', 'c_ethi_fre', 90, 'low'),
  ('sg_fre_incl', 'usr_frehiwet', 'c_incl_fre', 90, 'low')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 6. Insert Frehiwet's User Settings
INSERT INTO user_settings (user_id, study_hours_start, study_hours_end, available_days, notifications_enabled, theme, default_focus_duration, default_break_duration)
VALUES ('usr_frehiwet', '08:00', '22:00', '[1,2,3,4,5,6]', TRUE, 'light', 50, 10)
ON CONFLICT (user_id) DO NOTHING;
