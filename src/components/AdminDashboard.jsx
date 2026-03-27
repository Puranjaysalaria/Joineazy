import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ChevronRight,
  X,
  User,
  MessageSquare,
  Send,
  Check,
  Star,
  Award,
  Search,
  Filter,
  Mail,
  Pencil,
  Link,
  CheckCircle2,
  Bell,
} from "lucide-react";

export default function AdminDashboard({
  db,
  currentUser,
  addAssignment,
  removeAssignment,
  updateSubmission,
  sendNotification,
  updateAssignment,
}) {
  const [activeTab, setActiveTab] = useState("assignments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [gradingModal, setGradingModal] = useState({
    open: false,
    student: null,
    assignment: null,
    submission: null,
  });
  const [reminderModal, setReminderModal] = useState({
    open: false,
    student: null,
    assignment: null,
  });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [gradeData, setGradeData] = useState({ grade: "A", feedback: "" });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    driveLink: "",
  });

  // Filter assignments directly created by this admin
  const adminAssignments = db.assignments.filter(
    (a) => a.createdBy === currentUser.id,
  );
  const students = db.users.filter((u) => u.role === "student");
  const totalStudents = students.length;
  const totalAssignments = adminAssignments.length;
  const assignmentIds = new Set(adminAssignments.map((a) => String(a.id)));
  const studentIds = new Set(students.map((s) => String(s.id)));
  const totalPossibleSubmissions = totalStudents * totalAssignments;
  const completedSubmissionPairs = new Set(
    db.submissions
      .filter((s) => {
        const isRelevantAssignment = assignmentIds.has(String(s.assignmentId));
        const isRelevantStudent = studentIds.has(String(s.studentId));
        const isCompleted = s.status === "submitted" || s.status === "reviewed";
        return isRelevantAssignment && isRelevantStudent && isCompleted;
      })
      .map((s) => `${String(s.studentId)}-${String(s.assignmentId)}`),
  ).size;
  const globalProgress =
    totalPossibleSubmissions === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (completedSubmissionPairs / totalPossibleSubmissions) * 100,
          ),
        );

  const openGradingModal = (student, assignment, submission) => {
    setGradingModal({ open: true, student, assignment, submission });
    setGradeData({
      grade: submission.grade || "A",
      feedback: submission.feedback || "",
    });
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    updateSubmission(
      gradingModal.assignment.id,
      gradingModal.student.id,
      gradeData.grade,
      gradeData.feedback,
    );
    setGradingModal({
      open: false,
      student: null,
      assignment: null,
      submission: null,
    });
    setToastMessage(
      `Graded ${gradingModal.student.name}'s work: ${gradeData.grade}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (editingAssignment) {
      updateAssignment({ ...editingAssignment, ...formData });
      setToastMessage("Assignment updated successfully!");
    } else {
      addAssignment(formData);
      setToastMessage("Assignment created successfully!");
    }
    setFormData({ title: "", description: "", dueDate: "", driveLink: "" });
    setEditingAssignment(null);
    setIsModalOpen(false);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      driveLink: assignment.driveLink || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id, title) => {
    setAssignmentToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (assignmentToDelete) {
      removeAssignment(assignmentToDelete.id);
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
      setToastMessage("Assignment deleted successfully.");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  return (
    <main className="animate-fadeIn w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4 px-1 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white">
            Admin Dashboard
          </h1>
          <p className="text-textMuted text-xs sm:text-sm md:text-base">
            Manage assignments and track student progress.
          </p>
        </div>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => {
            setIsModalOpen(true);
            setEditingAssignment(null);
            setFormData({
              title: "",
              description: "",
              dueDate: "",
              driveLink: "",
            });
          }}
        >
          <Plus className="w-5 h-5" /> New Assignment
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slideDown">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">
              Total Students
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="p-3 bg-warning/10 rounded-lg text-warning">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {totalAssignments}
            </div>
            <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">
              Assignments
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="p-3 bg-success/10 rounded-lg text-success">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {globalProgress}%
            </div>
            <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">
              Global Progress
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-panel flex gap-1 sm:gap-2 p-1 mb-6 sm:mb-8 rounded-lg w-full sm:w-max shadow-sm overflow-x-auto no-scrollbar">
        <button
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${activeTab === "assignments" ? "bg-surfaceActive text-white" : "text-textMuted hover:text-white"}`}
          onClick={() => setActiveTab("assignments")}
        >
          Assignments
        </button>
        <button
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${activeTab === "students" ? "bg-surfaceActive text-white" : "text-textMuted hover:text-white"}`}
          onClick={() => setActiveTab("students")}
        >
          Student Progress
        </button>
      </div>

      {/* Assignments View */}
      {activeTab === "assignments" && (
        <div className="grid gap-6 grid-cols-1">
          {adminAssignments.map((assignment) => {
            const submittedCount = db.submissions.filter(
              (s) =>
                s.assignmentId === assignment.id &&
                (s.status === "submitted" || s.status === "reviewed"),
            ).length;
            const progressPercent =
              totalStudents === 0
                ? 0
                : Math.round((submittedCount / totalStudents) * 100);

            return (
              <div
                key={assignment.id}
                className="glass-panel p-6 rounded-xl animate-slideUp border-white/5 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-cardHover"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-white">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-textMuted mb-3">
                      {assignment.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-textMuted flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {new Date(assignment.dueDate)
                        .toISOString()
                        .split("T")[0] <
                        new Date().toISOString().split("T")[0] && (
                        <span className="px-2 py-0.5 bg-danger/10 text-danger rounded flex items-center gap-1 border border-danger/20 font-bold uppercase tracking-tighter text-[10px]">
                          <Clock className="w-3 h-3" /> Deadline Passed
                        </span>
                      )}
                      {assignment.driveLink && (
                        <span className="px-2 py-0.5 bg-surface rounded flex items-center gap-1 border border-white/10">
                          <Link className="w-3.5 h-3.5" /> Drive Attached
                        </span>
                      )}
                      <div className="flex items-center gap-3 ml-0 sm:ml-auto w-full sm:w-auto justify-end">
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-2 text-textMuted hover:text-primary transition-colors hover:bg-white/5 rounded-lg"
                          title="Edit Assignment"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(assignment.id, assignment.title)
                          }
                          className="p-2 text-textMuted hover:text-danger transition-colors hover:bg-white/5 rounded-lg"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right md:min-w-36">
                    <div className="text-sm font-semibold mb-1 text-white">
                      {submittedCount} / {totalStudents} Submitted
                    </div>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 relative shadow-glow"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {adminAssignments.length === 0 && (
            <p className="text-textMuted text-center py-8">
              No assignments created yet.
            </p>
          )}
        </div>
      )}

      {/* Students View */}
      {activeTab === "students" && (
        <div className="glass-panel rounded-xl overflow-hidden shadow-sm animate-slideUp">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="border-b border-borderColor bg-black/20">
                  <th className="p-4 text-textMuted font-medium text-sm">
                    Student
                  </th>
                  <th className="p-4 text-textMuted font-medium text-sm">
                    Active Submissions
                  </th>
                  <th className="hidden md:table-cell p-4 text-textMuted font-medium text-sm text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentSubmissions = db.submissions.filter(
                    (s) =>
                      s.studentId === student.id &&
                      adminAssignments.some(
                        (assign) => assign.id === s.assignmentId,
                      ),
                  );
                  const progressPercent =
                    totalAssignments === 0
                      ? 0
                      : Math.round(
                          (studentSubmissions.length / totalAssignments) * 100,
                        );

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-borderColor/50 last:border-0 hover:bg-surfaceHover transition-colors"
                    >
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary text-white flex justify-center items-center rounded-full font-bold text-xs shadow-glow">
                            {student.avatar}
                          </div>
                          <div>
                            <span className="font-medium text-white block">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-textMuted uppercase tracking-tight font-bold">
                              Student ID: #00{student.id}
                            </span>
                          </div>
                        </div>
                        {/* Individual Student Progress Bar */}
                        <div className="w-full max-w-40">
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-textMuted uppercase font-bold">
                              Progress
                            </span>
                            <span className="text-[10px] text-white font-bold">
                              {progressPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 shadow-glow ${progressPercent === 100 ? "bg-success shadow-success/20" : "bg-primary shadow-primary/20"}`}
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-2">
                          {adminAssignments.map((a) => {
                            const sub = studentSubmissions.find(
                              (s) => s.assignmentId === a.id,
                            );
                            return (
                              <div
                                key={a.id}
                                className="flex flex-wrap items-center justify-between gap-3 bg-black/20 px-3 py-2 rounded-lg border border-white/5"
                              >
                                <span className="text-xs text-white break-words max-w-full sm:max-w-36">
                                  {a.title}
                                </span>
                                {sub ? (
                                  <div className="flex flex-wrap items-center justify-end gap-2">
                                    {sub.grade ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 bg-success/20 text-success border border-success/30 rounded">
                                        Grade: {sub.grade}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded">
                                        Pending Review
                                      </span>
                                    )}
                                    <button
                                      className="text-[10px] text-white bg-primary/40 hover:bg-primary px-2 py-1 rounded transition-colors uppercase font-bold"
                                      onClick={() =>
                                        openGradingModal(student, a, sub)
                                      }
                                    >
                                      {sub.grade ? "Edit" : "Review"}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-textMuted italic">
                                        Not submitted
                                      </span>
                                      <button
                                        className="p-1.5 text-warning hover:bg-warning/10 rounded-md transition-all group/bell"
                                        title="Send Reminder"
                                        onClick={() =>
                                          setReminderModal({
                                            open: true,
                                            student,
                                            assignment: a,
                                          })
                                        }
                                      >
                                        <Bell className="w-3.5 h-3.5 group-hover/bell:animate-bounce" />
                                      </button>
                                    </div>
                                    {db.notifications?.some(
                                      (n) =>
                                        n.userId === student.id &&
                                        n.assignmentId === a.id,
                                    ) && (
                                      <span className="text-[9px] font-bold text-warning/80 flex items-center gap-1 bg-warning/5 px-2 py-0.5 rounded border border-warning/10 animate-fadeIn">
                                        <Clock className="w-2.5 h-2.5" />{" "}
                                        Reminded
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="hidden md:table-cell p-4 align-middle text-center">
                        <span
                          className={`status-badge ${progressPercent === 100 ? "status-submitted" : "status-pending"}`}
                        >
                          {progressPercent === 100
                            ? "All Clear"
                            : "Tasks Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Assignment Modal - Rendered via Portal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative animate-modalIn shadow-4xl border-white/10">
              <button
                className="absolute right-4 top-4 text-textMuted hover:text-white transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/20 rounded-xl text-primary border border-primary/20">
                  <Plus className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingAssignment ? "Edit Assignment" : "Create Assignment"}
                </h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-textMuted">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. UX Research Study"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-textMuted">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="input-field resize-none"
                    placeholder="Describe the task..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-textMuted">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input-field w-full"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 text-textMuted flex items-center gap-1">
                      <Link className="w-3.5 h-3.5" /> Drive Link
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://drive..."
                      value={formData.driveLink}
                      onChange={(e) =>
                        setFormData({ ...formData, driveLink: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn hover:bg-white/10 px-6"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-8 hover-glow shadow-primaryGlow"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal - Rendered via Portal */}
      {isDeleteModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
            <div className="glass-panel w-full max-w-sm rounded-2xl p-5 md:p-6 relative animate-modalIn border-danger/20 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-danger/20 rounded-full text-danger mb-4 border border-danger/30 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Delete Assignment?
                </h3>
                <p className="text-textMuted text-sm mb-6">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-semibold">
                    "{assignmentToDelete?.title}"
                  </span>
                  ? This action is permanent and will remove all student
                  submissions.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    className="btn flex-1 hover:bg-white/10"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn bg-danger hover:bg-danger/80 text-white flex-1 border-none shadow-lg shadow-danger/20"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Reminder Confirmation Modal */}
      {reminderModal.student &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
            <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center animate-modalIn shadow-4xl border-white/10">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex justify-center items-center mx-auto mb-5 border border-warning/30 shadow-warningSoft">
                <Bell className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-white">
                Send Reminder?
              </h2>
              <p className="text-textMuted mb-6 text-sm leading-relaxed">
                Confirm sending a submission reminder to{" "}
                <strong className="text-white">
                  {reminderModal.student.name}
                </strong>{" "}
                for{" "}
                <strong className="text-white">
                  "{reminderModal.assignment.title}"
                </strong>
                .
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="btn btn-primary w-full py-3 bg-warning hover:bg-warning/80 text-black font-bold shadow-lg shadow-warning/20 border-none"
                  onClick={() => {
                    sendNotification(
                      reminderModal.student.id,
                      reminderModal.assignment.id,
                      `Reminder: Submission for "${reminderModal.assignment.title}" is pending.`,
                    );
                    setToastMessage(
                      `Reminder sent to ${reminderModal.student.name}!`,
                    );
                    setTimeout(() => setToastMessage(""), 3000);
                    setReminderModal({ student: null, assignment: null });
                  }}
                >
                  Send Now 🚀
                </button>
                <button
                  className="btn w-full py-3 text-sm text-textMuted hover:text-white transition-colors"
                  onClick={() =>
                    setReminderModal({ student: null, assignment: null })
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Toast Notification */}
      {toastMessage &&
        createPortal(
          <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 bg-success/20 border border-success/50 text-success px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-glow animate-slideUp z-[9999] flex items-center gap-3 sm:max-w-md">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold break-words">{toastMessage}</span>
          </div>,
          document.body,
        )}

      {/* Grading Modal - Rendered via Portal */}
      {gradingModal.open &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 animate-modalIn shadow-4xl border-white/10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Review Submission
                    </h2>
                    <p className="text-xs text-textMuted">
                      Grading work for {gradingModal.student.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setGradingModal({ ...gradingModal, open: false })
                  }
                  className="text-textMuted hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-textMuted font-bold block mb-1">
                  Assignment
                </span>
                <span className="text-white font-semibold">
                  {gradingModal.assignment.title}
                </span>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Select Grade
                  </label>
                  <div className="flex gap-2">
                    {["A+", "A", "B", "C", "D", "F"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGradeData({ ...gradeData, grade: g })}
                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${gradeData.grade === g ? "bg-primary border-primary text-white shadow-glow" : "bg-surfaceActive border-white/5 text-textMuted hover:border-white/20"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Feedback for Student
                  </label>
                  <textarea
                    rows="4"
                    className="input-field resize-none bg-black/20"
                    placeholder="Excellent work on the analysis! Keep it up."
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, feedback: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    className="btn hover:bg-white/10"
                    onClick={() =>
                      setGradingModal({ ...gradingModal, open: false })
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-8 shadow-primaryGlow"
                  >
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
