import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Calendar, Users, CheckCircle, Clock, AlertTriangle,
  Trash2, X, MessageSquare, Check, Search, Bell, Pencil,
  Link, CheckCircle2, BookOpen, BarChart2, Filter, ChevronDown,
} from "lucide-react";
import CourseCard from "./CourseCard";
import ProgressRing from "./ProgressRing";

// ─────────────────────────────────────────────
// PROFESSOR DASHBOARD
// ─────────────────────────────────────────────
export default function ProfDashboard({
  db, currentUser, view, selectedCourse,
  onNavigateToCourse, onNavigateToDashboard,
  addAssignment, updateAssignment, removeAssignment,
  updateSubmission, sendNotification,
}) {
  const students = db.users.filter((u) => u.role === "student");
  const profCourses = db.courses.filter(
    (c) => String(c.profId) === String(currentUser.id)
  );

  // ── Course List View ──────────────────────────────────────────
  if (view === "dashboard") {
    return (
      <ProfCourseDashboard
        profCourses={profCourses}
        db={db}
        students={students}
        onNavigateToCourse={onNavigateToCourse}
      />
    );
  }

  // ── Course Detail View ────────────────────────────────────────
  if (view === "course" && selectedCourse) {
    return (
      <ProfCourseDetail
        course={selectedCourse}
        db={db}
        currentUser={currentUser}
        students={students}
        addAssignment={addAssignment}
        updateAssignment={updateAssignment}
        removeAssignment={removeAssignment}
        updateSubmission={updateSubmission}
        sendNotification={sendNotification}
      />
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// PROF: Course Dashboard (Screen 1)
// ─────────────────────────────────────────────
function ProfCourseDashboard({ profCourses, db, students, onNavigateToCourse }) {
  const totalAssignments = db.assignments.filter((a) =>
    profCourses.some((c) => c.id === a.courseId)
  ).length;

  const totalSubmissions = db.submissions.filter((s) =>
    db.assignments
      .filter((a) => profCourses.some((c) => c.id === a.courseId))
      .some((a) => String(a.id) === String(s.assignmentId))
  ).length;

  return (
    <main className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-slideDown">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Professor Dashboard
        </h1>
        <p className="text-textMuted text-sm">
          Manage your courses and track student progress.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 animate-slideDown">
        {[
          { label: "Courses", value: profCourses.length, icon: BookOpen, color: "text-primary bg-primary/10" },
          { label: "Students", value: students.length, icon: Users, color: "text-success bg-success/10" },
          { label: "Submissions", value: totalSubmissions, icon: CheckCircle2, color: "text-warning bg-warning/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel p-4 rounded-xl flex items-center gap-3 border-white/5">
            <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
              <div className="text-[10px] sm:text-xs text-textMuted uppercase tracking-wide font-semibold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Grid */}
      <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">Your Courses</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {profCourses.map((course, idx) => {
          const courseAssignments = db.assignments.filter((a) => a.courseId === course.id);
          const enrolledStudentIds = db.enrollments
            .filter((e) => e.courseId === course.id)
            .map((e) => Number(e.studentId));

          return (
            <div key={course.id} style={{ animationDelay: `${idx * 0.08}s` }}>
              <CourseCard
                course={course}
                role="admin"
                totalAssignments={courseAssignments.length}
                totalStudents={enrolledStudentIds.length}
                onClick={() => onNavigateToCourse(course)}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// PROF: Course Detail — Assignments + Progress
// ─────────────────────────────────────────────
function ProfCourseDetail({
  course, db, currentUser, students,
  addAssignment, updateAssignment, removeAssignment,
  updateSubmission, sendNotification,
}) {
  const [activeTab, setActiveTab] = useState("assignments");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [gradingModal, setGradingModal] = useState({ open: false, student: null, assignment: null, submission: null });
  const [reminderModal, setReminderModal] = useState({ open: false, student: null, assignment: null });
  const [gradeData, setGradeData] = useState({ grade: "A", feedback: "" });
  const [toastMsg, setToastMsg] = useState({ text: "", type: "success" });
  const [formData, setFormData] = useState({
    title: "", description: "", dueDate: "", driveLink: "", submissionType: "individual",
  });

  const enrolledStudentIds = db.enrollments
    .filter((e) => e.courseId === course.id)
    .map((e) => Number(e.studentId));
  const enrolledStudents = students.filter((s) => enrolledStudentIds.includes(s.id));
  const courseAssignments = db.assignments.filter((a) => a.courseId === course.id);

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: "", type: "success" }), 3200);
  };

  // Filter logic
  const filteredAssignments = courseAssignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    const submittedCount = db.submissions.filter(
      (s) => String(s.assignmentId) === String(a.id) && (s.status === "submitted" || s.status === "reviewed")
    ).length;
    if (filterStatus === "completed") return matchesSearch && submittedCount === enrolledStudents.length;
    if (filterStatus === "pending") return matchesSearch && submittedCount < enrolledStudents.length;
    return matchesSearch;
  });

  const openCreateModal = () => {
    setEditingAssignment(null);
    setFormData({ title: "", description: "", dueDate: "", driveLink: "", submissionType: "individual" });
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate ? assignment.dueDate.split("T")[0] : "",
      driveLink: assignment.driveLink || "",
      submissionType: assignment.submissionType || "individual",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      courseId: course.id,
      dueDate: formData.dueDate ? `${formData.dueDate}T23:59:00` : "",
    };
    if (editingAssignment) {
      updateAssignment({ ...editingAssignment, ...payload });
      showToast("Assignment updated successfully!");
    } else {
      addAssignment(payload);
      showToast("Assignment created!");
    }
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const handleDelete = () => {
    if (assignmentToDelete) {
      removeAssignment(assignmentToDelete.id);
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
      showToast("Assignment deleted.", "warning");
    }
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    updateSubmission(
      gradingModal.assignment.id,
      gradingModal.student.id,
      gradeData.grade,
      gradeData.feedback
    );
    showToast(`Graded ${gradingModal.student.name}: ${gradeData.grade}`);
    setGradingModal({ open: false, student: null, assignment: null, submission: null });
  };

  return (
    <main className="animate-fadeIn">
      {/* Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs text-textMuted font-semibold uppercase tracking-wide">{course.code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{course.name}</h1>
          <p className="text-textMuted text-sm mt-1">{enrolledStudents.length} students · {courseAssignments.length} assignments</p>
        </div>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center shrink-0"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-panel flex p-1 mb-6 rounded-xl w-full sm:w-max gap-1">
        {["assignments", "students"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-primary text-white shadow-glow"
                : "text-textMuted hover:text-white"
            }`}
          >
            {tab === "assignments" ? "Assignments" : "Student Progress"}
          </button>
        ))}
      </div>

      {/* ── ASSIGNMENTS TAB ──────────────────────────────── */}
      {activeTab === "assignments" && (
        <>
          {/* Filter/Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pl-9 pr-8 py-2.5 text-sm appearance-none cursor-pointer min-w-36"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredAssignments.map((assignment, idx) => {
              const subs = db.submissions.filter(
                (s) => String(s.assignmentId) === String(assignment.id) &&
                  (s.status === "submitted" || s.status === "reviewed")
              );
              const progress = enrolledStudents.length === 0 ? 0
                : Math.round((subs.length / enrolledStudents.length) * 100);
              const isOverdue = new Date(assignment.dueDate) < new Date();

              return (
                <div
                  key={assignment.id}
                  className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 animate-slideUp hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-base">{assignment.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                          assignment.submissionType === "group"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {assignment.submissionType}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-danger/10 text-danger border border-danger/20 rounded-full">
                            Deadline Passed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-textMuted mb-3 line-clamp-2">{assignment.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-textMuted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {assignment.driveLink && (
                          <a href={assignment.driveLink} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline">
                            <Link className="w-3.5 h-3.5" /> OneDrive Link
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: progress + actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:min-w-32">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{subs.length}/{enrolledStudents.length}</div>
                        <div className="text-[10px] text-textMuted">submitted</div>
                        <div className="w-24 h-1.5 bg-black/30 rounded-full overflow-hidden mt-1.5 ml-auto">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-700 shadow-glow"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setAssignmentToDelete(assignment); setIsDeleteModalOpen(true); }}
                          className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAssignments.length === 0 && (
              <div className="text-center py-16 animate-fadeIn">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <BarChart2 className="w-8 h-8 text-textMuted/40" />
                </div>
                <p className="text-textMuted">
                  {searchQuery || filterStatus !== "all" ? "No assignments match your filter." : "No assignments yet. Create one!"}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── STUDENT PROGRESS TAB ────────────────────────── */}
      {activeTab === "students" && (
        <div className="space-y-3">
          {enrolledStudents.map((student, idx) => {
            const studentSubs = db.submissions.filter(
              (s) => String(s.studentId) === String(student.id) &&
                courseAssignments.some((a) => String(a.id) === String(s.assignmentId))
            );
            const progress = courseAssignments.length === 0 ? 0
              : Math.round((studentSubs.length / courseAssignments.length) * 100);

            return (
              <div
                key={student.id}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/5 animate-slideUp hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-primary text-white flex justify-center items-center rounded-full font-bold text-xs shadow-glow shrink-0">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{student.name}</div>
                    <div className="text-[10px] text-textMuted">Student #{String(student.id).padStart(3, "0")}</div>
                  </div>
                  <ProgressRing
                    percent={progress}
                    size={40}
                    stroke={3}
                    colorClass={progress === 100 ? "text-success" : "text-primary"}
                  />
                </div>

                {/* Per-assignment status */}
                <div className="space-y-2">
                  {courseAssignments.map((a) => {
                    const sub = studentSubs.find((s) => String(s.assignmentId) === String(a.id));
                    const hasReminder = db.notifications?.some(
                      (n) => String(n.userId) === String(student.id) && String(n.assignmentId) === String(a.id)
                    );

                    return (
                      <div
                        key={a.id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-black/20 px-3 py-2.5 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sub ? "bg-success" : "bg-textMuted/30"}`} />
                          <span className="text-xs text-white truncate max-w-36 sm:max-w-52">{a.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border shrink-0 ${
                            a.submissionType === "group"
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}>{a.submissionType[0]}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {sub ? (
                            <>
                              {sub.grade ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-success/20 text-success border border-success/30 rounded-lg">
                                  {sub.grade}
                                </span>
                              ) : (
                                <span className="text-[10px] text-textMuted">Pending review</span>
                              )}
                              <button
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 transition-all uppercase"
                                onClick={() => setGradingModal({ open: true, student, assignment: a, submission: sub })}
                              >
                                {sub.grade ? "Edit" : "Grade"}
                              </button>
                            </>
                          ) : (
                            <>
                              {hasReminder && (
                                <span className="text-[9px] text-warning/80 bg-warning/5 border border-warning/10 px-1.5 py-0.5 rounded font-bold">
                                  Reminded
                                </span>
                              )}
                              <span className="text-[10px] text-textMuted italic">Not submitted</span>
                              <button
                                className="p-1.5 text-warning hover:bg-warning/15 rounded-lg transition-all"
                                title="Send Reminder"
                                onClick={() => setReminderModal({ open: true, student, assignment: a })}
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ MODALS (via Portal) ══════════════════════════════════ */}

      {/* Create/Edit Assignment Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative animate-modalIn shadow-4xl border-white/10 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute right-4 top-4 text-textMuted hover:text-white transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/20 rounded-xl text-primary border border-primary/20">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingAssignment ? "Edit Assignment" : "New Assignment"}
                </h2>
                <p className="text-xs text-textMuted">{course.name}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-textMuted">Title *</label>
                <input
                  type="text" required className="input-field focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="e.g. UX Research Case Study"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-textMuted">Description *</label>
                <textarea
                  required rows="3" className="input-field resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="Describe the assignment requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-textMuted">Due Date *</label>
                  <input
                    type="date" required className="input-field focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-textMuted">Submission Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["individual", "group"].map((t) => (
                      <button
                        key={t} type="button"
                        onClick={() => setFormData({ ...formData, submissionType: t })}
                        className={`py-2.5 rounded-xl text-sm font-semibold border capitalize transition-all ${
                          formData.submissionType === t
                            ? "bg-primary border-primary text-white shadow-glow"
                            : "bg-surface border-white/10 text-textMuted hover:border-white/20"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 text-textMuted flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5" /> OneDrive / Drive Link
                </label>
                <input
                  type="url" className="input-field focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="https://onedrive.live.com/..."
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button type="button" className="btn hover:bg-white/10 px-5"
                  onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-6 shadow-glow">
                  {editingAssignment ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 animate-modalIn border-danger/20">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-danger/20 rounded-full text-danger mb-4 border border-danger/30 animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Assignment?</h3>
              <p className="text-textMuted text-sm mb-5">
                <span className="text-white font-semibold">"{assignmentToDelete?.title}"</span> and all submissions will be permanently removed.
              </p>
              <div className="flex w-full gap-3">
                <button className="btn flex-1 hover:bg-white/10"
                  onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                <button className="btn bg-danger hover:bg-danger/80 text-white flex-1 border-none"
                  onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Grading Modal */}
      {gradingModal.open && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 animate-modalIn border-white/10">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Grade Submission</h2>
                  <p className="text-xs text-textMuted">{gradingModal.student?.name}</p>
                </div>
              </div>
              <button onClick={() => setGradingModal({ ...gradingModal, open: false })}
                className="text-textMuted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 p-3 bg-black/20 rounded-xl border border-white/5 text-sm text-white font-medium">
              {gradingModal.assignment?.title}
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Select Grade</label>
                <div className="flex gap-2">
                  {["A+", "A", "B", "C", "D", "F"].map((g) => (
                    <button
                      key={g} type="button"
                      onClick={() => setGradeData({ ...gradeData, grade: g })}
                      className={`flex-1 py-2.5 rounded-xl font-bold border text-sm transition-all ${
                        gradeData.grade === g
                          ? "bg-primary border-primary text-white shadow-glow"
                          : "bg-surface border-white/5 text-textMuted hover:border-white/20"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Feedback</label>
                <textarea
                  rows="3" className="input-field resize-none"
                  placeholder="Great work on the analysis..."
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" className="btn hover:bg-white/10"
                  onClick={() => setGradingModal({ ...gradingModal, open: false })}>Cancel</button>
                <button type="submit" className="btn btn-primary px-6">Submit Grade</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Reminder Confirmation Modal */}
      {reminderModal.open && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center animate-modalIn border-white/10">
            <div className="w-14 h-14 bg-warning/10 rounded-full flex justify-center items-center mx-auto mb-4 border border-warning/30">
              <Bell className="w-7 h-7 text-warning" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Send Reminder?</h2>
            <p className="text-textMuted text-sm mb-5 leading-relaxed">
              Send an urgent reminder to{" "}
              <strong className="text-white">{reminderModal.student?.name}</strong> for{" "}
              <strong className="text-white">"{reminderModal.assignment?.title}"</strong>.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="btn w-full py-2.5 bg-warning hover:bg-warning/80 text-black font-bold border-none"
                onClick={() => {
                  sendNotification(
                    reminderModal.student.id,
                    reminderModal.assignment.id,
                    `Reminder: "${reminderModal.assignment.title}" is pending.`
                  );
                  showToast(`Reminder sent to ${reminderModal.student.name}!`);
                  setReminderModal({ open: false, student: null, assignment: null });
                }}
              >
                Send Now 🚀
              </button>
              <button
                className="btn w-full text-textMuted hover:text-white hover:bg-white/5 border-none"
                onClick={() => setReminderModal({ open: false, student: null, assignment: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toastMsg.text && createPortal(
        <div className={`fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-sm px-5 py-3 rounded-xl shadow-lg animate-slideUp z-[9999] flex items-center gap-3 border ${
          toastMsg.type === "warning"
            ? "bg-warning/20 border-warning/40 text-warning"
            : "bg-success/20 border-success/40 text-success"
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg.text}</span>
        </div>,
        document.body
      )}
    </main>
  );
}
