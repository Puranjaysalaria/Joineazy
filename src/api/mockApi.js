// ============================================================
// Mock API Layer — simulates real REST API calls with async delays
// Swap these functions with real fetch() calls to connect a backend
// ============================================================

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ----------------------------------------------------------------
// DB Accessor — always reads latest from localStorage
// ----------------------------------------------------------------
const getDb = () => {
  const raw = localStorage.getItem("joineazy_db");
  return raw ? JSON.parse(raw) : null;
};

// ----------------------------------------------------------------
// COURSES
// ----------------------------------------------------------------
export const getCoursesByProf = async (profId) => {
  await delay(250);
  const db = getDb();
  return db.courses.filter((c) => c.profId === String(profId) || c.profId === profId);
};

export const getCoursesByStudent = async (studentId) => {
  await delay(250);
  const db = getDb();
  const enrolled = db.enrollments
    .filter((e) => String(e.studentId) === String(studentId))
    .map((e) => e.courseId);
  return db.courses.filter((c) => enrolled.includes(c.id));
};

export const getCourseById = async (courseId) => {
  await delay(150);
  const db = getDb();
  return db.courses.find((c) => c.id === courseId) || null;
};

// ----------------------------------------------------------------
// ASSIGNMENTS
// ----------------------------------------------------------------
export const getAssignmentsByCourse = async (courseId) => {
  await delay(200);
  const db = getDb();
  return db.assignments.filter((a) => a.courseId === courseId);
};

export const getAssignmentById = async (assignmentId) => {
  await delay(150);
  const db = getDb();
  return db.assignments.find((a) => String(a.id) === String(assignmentId)) || null;
};

// ----------------------------------------------------------------
// GROUPS
// ----------------------------------------------------------------
export const getGroupsByCourse = async (courseId) => {
  await delay(200);
  const db = getDb();
  return (db.groups || []).filter((g) => g.courseId === courseId);
};

export const getGroupByStudent = async (studentId, courseId) => {
  await delay(150);
  const db = getDb();
  return (
    (db.groups || []).find(
      (g) =>
        g.courseId === courseId &&
        (g.memberIds.includes(Number(studentId)) || g.memberIds.includes(String(studentId)))
    ) || null
  );
};

// ----------------------------------------------------------------
// SUBMISSIONS
// ----------------------------------------------------------------
export const getSubmissionsByAssignment = async (assignmentId) => {
  await delay(200);
  const db = getDb();
  return db.submissions.filter(
    (s) => String(s.assignmentId) === String(assignmentId)
  );
};

export const getSubmissionByStudent = async (studentId, assignmentId) => {
  await delay(150);
  const db = getDb();
  return (
    db.submissions.find(
      (s) =>
        String(s.studentId) === String(studentId) &&
        String(s.assignmentId) === String(assignmentId)
    ) || null
  );
};

// ----------------------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------------------
export const getNotificationsByUser = async (userId) => {
  await delay(100);
  const db = getDb();
  return (db.notifications || []).filter(
    (n) => String(n.userId) === String(userId)
  );
};

export default {
  getCoursesByProf,
  getCoursesByStudent,
  getCourseById,
  getAssignmentsByCourse,
  getAssignmentById,
  getGroupsByCourse,
  getGroupByStudent,
  getSubmissionsByAssignment,
  getSubmissionByStudent,
  getNotificationsByUser,
};
