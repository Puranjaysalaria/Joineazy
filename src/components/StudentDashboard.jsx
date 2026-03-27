import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  UploadCloud,
  CheckCircle,
  FileText,
  Clock,
  FileCheck,
  Layout,
} from "lucide-react";

export default function StudentDashboard({
  db,
  currentUser,
  addSubmission,
  notifications,
}) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalState, setModalState] = useState("none"); // 'none', 'confirm'
  const [fileAttached, setFileAttached] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const assignmentsWithStatus = db.assignments.map((a) => {
    const sub = db.submissions.find(
      (s) =>
        String(s.assignmentId) === String(a.id) &&
        String(s.studentId) === String(currentUser.id),
    );
    const isOverdue =
      new Date(a.dueDate).toISOString().split("T")[0] <
      new Date().toISOString().split("T")[0];
    const hasReminder = notifications?.some(
      (n) => String(n.assignmentId) === String(a.id),
    );
    return {
      ...a,
      isSubmitted: !!sub,
      grade: sub?.grade,
      feedback: sub?.feedback,
      isOverdue,
      hasReminder,
    };
  });

  const completedCount = assignmentsWithStatus.filter(
    (a) => a.isSubmitted,
  ).length;
  const totalCount = assignmentsWithStatus.length;

  const handleInitiate = (assignment) => {
    setSelectedAssignment(assignment);
    setModalState("confirm");
  };

  const handleNextStep = () => {
    setModalState("final");
  };

  const handleConfirm = () => {
    addSubmission(selectedAssignment.id);
    setModalState("none");
    setTimeout(() => {
      setSelectedAssignment(null);
      setFileAttached(false);
    }, 300);

    // Show success popup notification
    setToastMessage(`"${selectedAssignment.title}" submitted successfully!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleClose = () => {
    setModalState("none");
    setTimeout(() => {
      setSelectedAssignment(null);
      setFileAttached(false);
    }, 300); // cleanup after animation
  };

  return (
    <main className="animate-fadeIn w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-6 animate-slideDown">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
            Welcome back, {currentUser.name.split(" ")[0]}!
          </h1>
          <p className="text-textMuted text-xs sm:text-sm md:text-base">
            You have{" "}
            <span className="text-primary font-bold">
              {totalCount - completedCount} tasks
            </span>{" "}
            remaining.
          </p>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-xl shadow-lg border-white/10 flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-surface/50 relative flex items-center justify-center">
            <div
              className="absolute inset-0 border-4 border-primary rounded-full"
              style={{
                clipPath: `inset(0 ${100 - (completedCount / (totalCount || 1)) * 100}% 0 0)`,
              }}
            ></div>
            <span className="text-[10px] sm:text-xs font-bold">
              {Math.round((completedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white leading-tight">
              Course Progress
            </div>
            <div className="text-[10px] sm:text-xs text-textMuted">
              {completedCount} of {totalCount} Completed
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {assignmentsWithStatus.map((assignment, idx) => (
          <div
            key={assignment.id}
            className="glass-panel p-4 sm:p-6 rounded-xl animate-slideUp flex flex-col border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-cardHover relative overflow-hidden"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Ambient Background Glow Effect */}
            <div
              className="absolute top-[-50px] right-[-50px] w-64 h-64 opacity-30 pointer-events-none transition-colors duration-700 z-0"
              style={{
                background: `radial-gradient(circle, ${assignment.isSubmitted ? "#10b981" : assignment.hasReminder ? "#ef4444" : "#8b5cf6"} 0%, transparent 70%)`,
              }}
            ></div>

            {/* Urgent Reminder Badge */}
            {assignment.hasReminder && !assignment.isSubmitted && (
              <div className="absolute bottom-24 right-6 animate-bounce z-20">
                <div className="bg-danger text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-danger/40 flex items-center gap-1 border border-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  URGENT REMINDER
                </div>
              </div>
            )}
            <div className="flex flex-wrap justify-between items-start mb-4 relative z-10 gap-2">
              <span
                className={`status-badge flex items-center gap-1 ${
                  assignment.isSubmitted
                    ? "status-submitted"
                    : assignment.isOverdue
                      ? "bg-danger/10 text-danger border-danger/20"
                      : "status-pending"
                }`}
              >
                {assignment.isSubmitted ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Submitted
                  </>
                ) : assignment.isOverdue ? (
                  "Deadline Passed"
                ) : (
                  "Pending"
                )}
              </span>
              <span
                className={`text-xs flex items-center gap-1 font-medium bg-black/20 px-2 py-1 rounded-md ${assignment.isOverdue && !assignment.isSubmitted ? "text-danger" : "text-textMuted"}`}
              >
                <Clock className="w-3.5 h-3.5" />{" "}
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold mb-2 text-white break-words">
              {assignment.title}
            </h3>
            <p className="text-sm text-textMuted mb-4 flex-grow">
              {assignment.description}
            </p>

            {/* Instructor Feedback Section */}
            {assignment.grade && (
              <div className="mb-5 p-4 rounded-xl bg-success/10 border border-success/20 animate-fadeIn relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <FileCheck className="w-8 h-8 text-success" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-success px-2 py-0.5 bg-success/20 rounded">
                    Graded: {assignment.grade}
                  </span>
                </div>
                {assignment.feedback && (
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    <span className="font-bold not-italic text-success">
                      Feedback:
                    </span>{" "}
                    "{assignment.feedback}"
                  </p>
                )}
              </div>
            )}

            {assignment.driveLink && (
              <a
                href={assignment.driveLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:text-primaryHover transition-colors inline-flex items-center gap-1 mb-5 max-w-full font-medium bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 break-words"
              >
                <FileText className="w-4 h-4" /> Supporting Materials
              </a>
            )}

            <div className="mt-auto pt-4 border-t border-white/10 relative z-10">
              {assignment.isSubmitted ? (
                assignment.isOverdue ? (
                  <button
                    className="btn w-full btn-success flex justify-center items-center gap-2 cursor-not-allowed opacity-70"
                    disabled
                    title="Deadline passed, cannot edit"
                  >
                    <CheckCircle className="w-4 h-4" /> Submitted (Locked)
                  </button>
                ) : (
                  <button
                    className="btn w-full bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 flex justify-center items-center gap-2"
                    onClick={() => handleInitiate(assignment)}
                  >
                    <UploadCloud className="w-4 h-4" /> Edit Submission
                  </button>
                )
              ) : assignment.isOverdue ? (
                <button
                  className="btn w-full bg-danger/10 text-danger border-danger/20 flex justify-center items-center gap-2 cursor-not-allowed opacity-80"
                  disabled
                >
                  <Clock className="w-4 h-4" /> Deadline Passed
                </button>
              ) : (
                <button
                  className="btn btn-primary w-full flex justify-center items-center gap-2"
                  onClick={() => handleInitiate(assignment)}
                >
                  <UploadCloud className="w-5 h-5" /> Submit Work
                </button>
              )}
            </div>
          </div>
        ))}
        {totalCount === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-glow">
              <Layout className="w-10 h-10 text-textMuted/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Everything's Clear!
            </h3>
            <p className="text-textMuted max-w-xs">
              No assignments have been posted yet. Enjoy your free time or check
              back later.
            </p>
          </div>
        )}
      </div>

      {/* Double Verification Modals - Rendered via Portal */}
      {modalState !== "none" &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
            {modalState === "confirm" && selectedAssignment && (
              <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 text-center animate-modalIn shadow-4xl border-white/10 relative">
                <div className="w-16 h-16 bg-surface rounded-full flex justify-center items-center mx-auto mb-5 border border-primary/50 shadow-glow">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">
                  Upload Submission
                </h2>
                <p className="text-textMuted mb-6 text-xs sm:text-sm leading-relaxed">
                  Step 1 of 2: Please attach your completed assignment for{" "}
                  <strong className="text-white">
                    "{selectedAssignment.title}"
                  </strong>
                  .
                </p>

                {/* File Attachment UI */}
                <div className="mb-6 text-left bg-black/20 p-4 rounded-xl border border-white/5">
                  <label className="block text-xs font-medium mb-2 text-textMuted">
                    Choose File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFileAttached(e.target.files.length > 0)}
                    className="block w-full text-xs text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] sm:text-xs file:font-semibold file:bg-primary/20 file:text-primary file:transition-all hover:file:bg-primary hover:file:text-white file:cursor-pointer cursor-pointer"
                  />
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    className="btn flex-1 py-3 text-xs sm:text-sm hover:bg-white/10"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className={`btn flex-1 py-3 text-xs sm:text-sm ${fileAttached ? "btn-primary shadow-primaryGlow" : "bg-surfaceActive text-textMuted cursor-not-allowed"}`}
                    disabled={!fileAttached}
                    onClick={handleNextStep}
                  >
                    Submit
                  </button>
                </div>
                {!fileAttached && (
                  <p className="text-[10px] text-warning mt-3">
                    File selection required to proceed
                  </p>
                )}
              </div>
            )}

            {modalState === "final" && selectedAssignment && (
              <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center animate-fadeIn shadow-4xl border-white/10 relative">
                <div className="w-16 h-16 bg-surface rounded-full flex justify-center items-center mx-auto mb-5 border border-warning/50 shadow-glow">
                  <CheckCircle className="w-8 h-8 text-warning" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">
                  Are you sure?
                </h2>
                <p className="text-textMuted mb-6 text-xs leading-relaxed">
                  You are about to submit your work for{" "}
                  <strong className="text-white">
                    "{selectedAssignment.title}"
                  </strong>
                  . This action will mark the assignment as complete.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    className="btn btn-primary w-full py-3 shadow-glow"
                    onClick={handleConfirm}
                  >
                    Yes, I'm Sure
                  </button>
                  <button
                    className="btn w-full py-3 text-xs text-textMuted hover:text-white border-none"
                    onClick={() => setModalState("confirm")}
                  >
                    Wait, Go Back
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}

      {/* Toast Notification Pop-up - Rendered via Portal */}
      {toastMessage &&
        createPortal(
          <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 bg-success/20 border border-success/50 text-success px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-glow animate-slideUp z-[9999] flex items-center gap-3 sm:max-w-md">
            <FileCheck className="w-6 h-6" />
            <span className="font-semibold break-words">{toastMessage}</span>
          </div>,
          document.body,
        )}
    </main>
  );
}
