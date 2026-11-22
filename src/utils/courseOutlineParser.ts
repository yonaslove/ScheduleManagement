import { StudyType } from '../types';

export interface ParsedOutlineTopic {
  title: string;
  unitOrWeek?: string;
  hours?: number;
  studyType?: StudyType;
  priority?: 'high' | 'medium' | 'low';
}

export interface ParsedCourseOutline {
  courseCode?: string;
  courseTitle?: string;
  fileName: string;
  topics: ParsedOutlineTopic[];
  rawTextPreview: string;
}

/**
 * Intelligent client-side syllabus & course outline parser.
 * Extracts unit titles, lecture chapters, key modules, exam preps, and lab topics.
 */
export function parseCourseOutlineText(fileName: string, text: string): ParsedCourseOutline {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let courseCode = '';
  let courseTitle = '';
  const topics: ParsedOutlineTopic[] = [];

  // 1. Try to detect Course Code and Course Title from top 20 lines
  const topLines = lines.slice(0, 25);
  for (const line of topLines) {
    // Course code patterns like ANAT 201, BIOC201, CS 101, PUBH-201
    const codeMatch = line.match(/\b([A-Z]{2,6})\s?[-:]?\s?([0-9]{3,4}[A-Za-z]?)\b/i);
    if (codeMatch && !courseCode) {
      courseCode = `${codeMatch[1].toUpperCase()} ${codeMatch[2]}`;
    }

    if (
      !courseTitle &&
      (line.toLowerCase().includes('course title') ||
       line.toLowerCase().includes('module:') ||
       line.toLowerCase().includes('subject:') ||
       line.toLowerCase().includes('course:'))
    ) {
      const parts = line.split(/[:\-–]/);
      if (parts[1] && parts[1].trim().length > 3) {
        courseTitle = parts[1].trim();
      }
    }
  }

  // Fallback title from filename if not found in text
  if (!courseTitle) {
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    courseTitle = cleanFileName;
  }

  // 2. Line-by-line topic / unit / chapter detection
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Filter out obvious metadata or headers
    if (
      line.toLowerCase().startsWith('instructor') ||
      line.toLowerCase().startsWith('office hours') ||
      line.toLowerCase().startsWith('email:') ||
      line.toLowerCase().startsWith('prerequisite') ||
      line.length < 4 ||
      line.length > 140
    ) {
      continue;
    }

    // Pattern A: Unit / Chapter / Module / Week header
    // e.g. "Unit 1: Introduction to Anatomy", "Chapter 4 - Cellular Respiration", "Week 3: Enzymes"
    const unitMatch = line.match(/^(unit|chapter|module|week|part|topic|session)\s*([0-9ivx]+)[\s:.\-–]+(.+)/i);
    if (unitMatch) {
      const label = `${unitMatch[1].toUpperCase()} ${unitMatch[2]}`;
      const title = unitMatch[3].trim().replace(/^[:.\-–\s]+/, '');
      if (title.length > 2) {
        topics.push({
          unitOrWeek: label,
          title: `${label}: ${title}`,
          studyType: inferStudyType(title),
          priority: inferPriority(title),
          hours: 3,
        });
        continue;
      }
    }

    // Pattern B: Numbered outline items like "1.1 Gross Anatomy of Heart", "1. Cardiovascular System"
    const numberedMatch = line.match(/^(\d+(\.\d+)?)\s*[\).:\-–]\s+(.+)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const title = numberedMatch[3].trim();
      if (title.length > 4 && !title.toLowerCase().startsWith('page') && !title.toLowerCase().startsWith('table')) {
        topics.push({
          unitOrWeek: `Topic ${num}`,
          title: title,
          studyType: inferStudyType(title),
          priority: inferPriority(title),
          hours: 2,
        });
        continue;
      }
    }

    // Pattern C: Bullet items with topic keywords
    if (/^[•\-*]\s+/.test(line)) {
      const cleaned = line.replace(/^[•\-*]\s+/, '').trim();
      if (cleaned.length > 5 && cleaned.length < 90) {
        // Only accept if it looks like a substantive topic
        topics.push({
          title: cleaned,
          studyType: inferStudyType(cleaned),
          priority: inferPriority(cleaned),
          hours: 2,
        });
      }
    }
  }

  // If no structured units were caught, take reasonable non-empty descriptive paragraphs
  if (topics.length === 0) {
    const candidateLines = lines
      .filter((l) => l.length > 10 && l.length < 80 && !l.includes('@') && !l.includes('http'))
      .slice(0, 12);

    candidateLines.forEach((cl, idx) => {
      topics.push({
        unitOrWeek: `Module ${idx + 1}`,
        title: cl,
        studyType: 'learning',
        priority: 'medium',
        hours: 2,
      });
    });
  }

  return {
    courseCode: courseCode || undefined,
    courseTitle: courseTitle || fileName,
    fileName,
    topics,
    rawTextPreview: lines.slice(0, 10).join('\n'),
  };
}

function inferStudyType(text: string): StudyType {
  const lower = text.toLowerCase();
  if (lower.includes('exam') || lower.includes('midterm') || lower.includes('final') || lower.includes('test')) {
    return 'exam-prep';
  }
  if (lower.includes('assignment') || lower.includes('homework') || lower.includes('project') || lower.includes('report')) {
    return 'assignment';
  }
  if (lower.includes('lab') || lower.includes('practical') || lower.includes('dissection') || lower.includes('experiment')) {
    return 'practice';
  }
  if (lower.includes('group') || lower.includes('seminar') || lower.includes('discussion')) {
    return 'group-work';
  }
  if (lower.includes('review') || lower.includes('summary') || lower.includes('recap')) {
    return 'revision';
  }
  return 'learning';
}

function inferPriority(text: string): 'high' | 'medium' | 'low' {
  const lower = text.toLowerCase();
  if (lower.includes('final') || lower.includes('midterm') || lower.includes('exam') || lower.includes('clinical')) {
    return 'high';
  }
  return 'medium';
}
