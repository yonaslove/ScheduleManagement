-- Initial PostgreSQL Schema for Schedule Management System

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

-- Seed initial demo users
INSERT INTO users (id, name, email, password_hash, program)
VALUES 
  ('usr_fikirte', 'Frehiwet (Fre)', 'fre@gmail.com', '12345678F', 'Public Health (Year II, Sem I)'),
  ('usr_pubhealth', 'Fikirte (Public Health II)', 'publichealth@university.edu', 'demo123', 'Public Health (Year II, Sem I)'),
  ('usr_alex', 'Alex Rivera', 'alex@university.edu', 'demo123', 'Computer Science')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name;

