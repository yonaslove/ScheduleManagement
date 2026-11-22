import * as XLSX from 'xlsx';
import { ScheduleEvent, Course, Task, StudySession } from '../types';

export const exportScheduleToExcel = (
  events: ScheduleEvent[],
  courses: Course[],
  tasks: Task[],
  studySessions: StudySession[],
  studentName = 'Student'
) => {
  const getCourse = (id?: string) => courses.find((c) => c.id === id);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Sheet 1: Weekly Class Schedule
  const classRows = events
    .filter((e) => e.type === 'class' || e.type === 'lab')
    .sort((a, b) => {
      const dayA = a.dayOfWeek ?? 7;
      const dayB = b.dayOfWeek ?? 7;
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    })
    .map((e) => {
      const c = getCourse(e.courseId);
      return {
        'Day': e.dayOfWeek !== undefined ? dayNames[e.dayOfWeek] : 'Specific Date: ' + e.date,
        'Start Time': e.startTime,
        'End Time': e.endTime,
        'Course Code': c?.code || '-',
        'Course Title': c?.title || e.title,
        'Type': e.type.toUpperCase(),
        'Location / Room': e.location || c?.location || '-',
        'Instructor & Contact': c?.instructor || '-',
        'Credits': c?.credits ?? '-',
      };
    });

  // Sheet 2: Exam Timetable
  const examRows = events
    .filter((e) => e.type === 'exam')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .map((e) => {
      const c = getCourse(e.courseId);
      return {
        'Date': e.date,
        'Time': `${e.startTime} - ${e.endTime}`,
        'Course Code': c?.code || '-',
        'Course Title': c?.title || e.title,
        'Location': e.location || 'Examination Hall',
        'Instructor': c?.instructor || '-',
      };
    });

  // Sheet 3: Study Planner & Study Blocks
  const studyRows = studySessions
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .map((s) => {
      const c = getCourse(s.courseId);
      return {
        'Date': s.date,
        'Time': `${s.startTime} - ${s.endTime}`,
        'Course': c ? `${c.code} (${c.title})` : 'General',
        'Topic': s.topic,
        'Goal / Objective': s.goal || '-',
        'Target Duration (min)': s.durationMinutes,
        'Actual Studied (min)': s.actualDurationMinutes || 0,
        'Status': s.status.toUpperCase(),
      };
    });

  // Sheet 4: Tasks & Assignments
  const taskRows = tasks
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .map((t) => {
      const c = getCourse(t.courseId);
      return {
        'Task Title': t.title,
        'Course': c?.code || '-',
        'Type': t.type.toUpperCase(),
        'Due Date': t.dueAt.replace('T', ' '),
        'Priority': t.priority.toUpperCase(),
        'Est. Minutes': t.estimatedMinutes,
        'Status': t.status.toUpperCase(),
      };
    });

  // Sheet 5: Courses & Curriculum
  const courseRows = courses.map((c) => ({
    'Course Code': c.code,
    'Course Title': c.title,
    'Credits': c.credits,
    'Instructor': c.instructor || '-',
    'Default Location': c.location || '-',
    'Notes / Syllabus': c.notes || '-',
  }));

  const wb = XLSX.utils.book_new();

  const wsClasses = XLSX.utils.json_to_sheet(classRows.length > 0 ? classRows : [{ Notice: 'No classes scheduled' }]);
  const wsExams = XLSX.utils.json_to_sheet(examRows.length > 0 ? examRows : [{ Notice: 'No exams scheduled' }]);
  const wsStudy = XLSX.utils.json_to_sheet(studyRows.length > 0 ? studyRows : [{ Notice: 'No study sessions scheduled' }]);
  const wsTasks = XLSX.utils.json_to_sheet(taskRows.length > 0 ? taskRows : [{ Notice: 'No tasks added' }]);
  const wsCourses = XLSX.utils.json_to_sheet(courseRows.length > 0 ? courseRows : [{ Notice: 'No courses registered' }]);

  XLSX.utils.book_append_sheet(wb, wsClasses, 'Class Timetable');
  XLSX.utils.book_append_sheet(wb, wsExams, 'Exams');
  XLSX.utils.book_append_sheet(wb, wsStudy, 'Study Sessions');
  XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks & Deadlines');
  XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses');

  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanName}_Full_Academic_Schedule.xlsx`;
  XLSX.writeFile(wb, filename);
};

