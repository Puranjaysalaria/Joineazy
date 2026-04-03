import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle, Clock, FileText, UploadCloud, Users, AlertCircle,
  BookOpen, X, FileCheck, Crown, UserPlus, LogOut as LeaveIcon,
  ChevronRight, Bell, Star, Activity,
} from "lucide-react";
import CourseCard from "./CourseCard";
import ProgressRing from "./ProgressRing";

// ─────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────
export default function StudentDashboard({
  db, currentUser, view, selectedCourse,
  onNavigateToCourse, onNavigateToDashboard,
  addSubmission, addGroupSubmission, createGroup, joinGroup, leaveGroup,
  changeGroupLeader, removeGroupMember, addGroupMember, clearNotification, notifications,
}) {
  // Student's enrolled courses
  const enrolledCourseIds = db.enrollments
    .filter((e) => String(e.studentId) === String(currentUser.id))
    .map((e) => e.courseId);
  const enrolledCourses = db.courses.filter((c) => enrolledCourseIds.includes(c.id));

  // ── Course List View ──────────────────────────────────────────
  if (view === "dashboard") {
    return (
      <StudentCourseDashboard
        enrolledCourses={enrolledCourses}
        db={db}
        currentUser={currentUser}
        notifications={notifications}
        onNavigateToCourse={onNavigateToCourse}
        clearNotification={clearNotification}
      />
    );
  }

  // ── Course Detail View ────────────────────────────────────────
  if (view === "course" && selectedCourse) {
    return (
      <StudentCourseDetail
        course={selectedCourse}
        db={db}
        currentUser={currentUser}
        notifications={notifications}
        addSubmission={addSubmission}
        addGroupSubmission={addGroupSubmission}
        createGroup={createGroup}
        joinGroup={joinGroup}
        leaveGroup={leaveGroup}
        changeGroupLeader={changeGroupLeader}
        removeGroupMember={removeGroupMember}
        addGroupMember={addGroupMember}
      />
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// STUDENT: Course Dashboard (Screen 1)
// ─────────────────────────────────────────────
function StudentCourseDashboard({
  enrolledCourses, db, currentUser, notifications, onNavigateToCourse, clearNotification
}) {
  const totalAssignments = db.assignments.filter((a) =>
    enrolledCourses.some((c) => c.id === a.courseId)
  ).length;

  const completedAssignments = db.submissions.filter(
    (s) =>
      String(s.studentId) === String(currentUser.id) &&
      db.assignments
        .filter((a) => enrolledCourses.some((c) => c.id === a.courseId))
        .some((a) => String(a.id) === String(s.assignmentId))
  ).length;

  const totalPercent = totalAssignments === 0 ? 0
    : Math.round((completedAssignments / totalAssignments) * 100);

  return (
    <main className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-slideDown">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back, {currentUser.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-textMuted text-sm">
            {totalAssignments - completedAssignments > 0
              ? `You have ${totalAssignments - completedAssignments} pending ${totalAssignments - completedAssignments === 1 ? "assignment" : "assignments"}.`
              : "All caught up! Great work 🎉"}
          </p>
        </div>
        <div className="glass-panel p-4 rounded-xl border-white/5 shrink-0 flex items-center gap-3">
          <ProgressRing
            percent={totalPercent}
            size={52}
            stroke={4}
            colorClass="text-primary"
            label="Overall Progress"
            sublabel={`${completedAssignments}/${totalAssignments} done`}
          />
        </div>
      </div>

      {/* Urgent Reminders Banner */}
      {notifications.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-danger/10 border border-danger/30 flex flex-col gap-4 animate-slideDown shadow-lg">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0 p-2.5 bg-danger/20 rounded-xl border border-danger/30">
              <Bell className="w-6 h-6 text-danger" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full animate-ping shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-surface" />
            </div>
            <div>
              <p className="text-base font-bold text-danger mb-1">Urgent Reminders</p>
              <p className="text-sm text-danger/80">
                You have {notifications.length} pending reminder{notifications.length > 1 ? "s" : ""} from your professor.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-1 sm:pl-14">
            {notifications.map((notif, idx) => {
               // Handle different notification types
               let title = "";
               let subtext = "";
               let buttonText = "View Details";
               let targetCourse = null;

               if (notif.type === "course") {
                 // Course Enrollment notification
                 title = "New Enrollment";
                 subtext = notif.desc;
                 buttonText = "View Course";
                 targetCourse = db.courses.find(c => String(c.id) === String(notif.assignmentId?.replace('welcome_', '')));
               } else {
                 // Standard Assignment notification
                 const assignment = db.assignments.find(a => String(a.id) === String(notif.assignmentId));
                 if (!assignment) return null;
                 title = assignment.title;
                 targetCourse = db.courses.find(c => String(c.id) === String(assignment.courseId));
                 subtext = `${targetCourse?.code || ''} · ${targetCourse?.name || ''}`;
                 buttonText = "View Assignment";
               }
               
               return (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-danger/5 hover:bg-danger/10 p-3 sm:px-4 rounded-xl border border-danger/20 transition-colors">
                   <div className="min-w-0">
                     <p className="text-sm font-semibold text-danger/90 truncate">{title}</p>
                     <p className="text-xs text-danger/70 mt-0.5">{subtext}</p>
                   </div>
                   <button 
                     onClick={() => {
                       clearNotification(notif.id);
                       if (targetCourse) onNavigateToCourse(targetCourse);
                     }}
                     className="text-xs font-bold px-4 py-2 bg-danger/20 text-danger border border-danger/30 hover:bg-danger hover:text-white hover:border-danger hover:shadow-cardHover rounded-lg transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1 shrink-0"
                   >
                     {buttonText}
                   </button>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Courses list */}
        <div className="flex-1 min-w-0">
          {/* Course Grid */}
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">
            Your Courses ({enrolledCourses.length})
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {enrolledCourses.map((course, idx) => {
              const courseAssignments = db.assignments.filter((a) => a.courseId === course.id);
              const completed = db.submissions.filter(
                (s) =>
                  String(s.studentId) === String(currentUser.id) &&
                  courseAssignments.some((a) => String(a.id) === String(s.assignmentId))
              ).length;

              return (
                <div key={course.id} style={{ animationDelay: `${idx * 0.08}s` }}>
                  <CourseCard
                    course={course}
                    role="student"
                    totalAssignments={courseAssignments.length}
                    completedAssignments={completed}
                    onClick={() => onNavigateToCourse(course)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:w-80 shrink-0">
          <StudentActivityFeed db={db} currentUser={currentUser} />
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// STUDENT: Course Detail (Screen 2)
// ─────────────────────────────────────────────
function StudentCourseDetail({
  course, db, currentUser, notifications,
  addSubmission, addGroupSubmission, createGroup, joinGroup, leaveGroup,
  changeGroupLeader, removeGroupMember, addGroupMember,
}) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalState, setModalState] = useState("none"); // none | confirm | final
  const [toastMsg, setToastMsg] = useState({ text: "", type: "success" });
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [isClosingPanel, setIsClosingPanel] = useState(false);

  const handleCloseGroupPanel = () => {
    setIsClosingPanel(true);
    setTimeout(() => {
      setShowGroupPanel(false);
      setIsClosingPanel(false);
    }, 300);
  };

  const toggleGroupPanel = () => {
    if (showGroupPanel) handleCloseGroupPanel();
    else setShowGroupPanel(true);
  };

  const courseAssignments = db.assignments.filter((a) => a.courseId === course.id);
  const myGroup = (db.groups || []).find(
    (g) =>
      g.courseId === course.id &&
      (g.memberIds.includes(currentUser.id) ||
        g.memberIds.includes(String(currentUser.id)))
  );

  const getSubmission = (assignmentId) =>
    db.submissions.find(
      (s) =>
        String(s.studentId) === String(currentUser.id) &&
        String(s.assignmentId) === String(assignmentId)
    );

  const completedCount = courseAssignments.filter((a) => !!getSubmission(a.id)).length;

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: "", type: "success" }), 3200);
  };

  const handleAcknowledge = (assignment) => {
    if (assignment.submissionType === "group") {
      setSelectedAssignment(assignment);
      setModalState("group-confirm");
    } else {
      setSelectedAssignment(assignment);
      setModalState("confirm");
    }
  };

  const confirmIndividual = () => {
    addSubmission(selectedAssignment.id);
    showToast(`"${selectedAssignment.title}" acknowledged!`);
    setModalState("none");
    setSelectedAssignment(null);
  };

  const confirmGroup = () => {
    addGroupSubmission(selectedAssignment.id, course.id);
    showToast(`Group acknowledged "${selectedAssignment.title}" for all members!`);
    setModalState("none");
    setSelectedAssignment(null);
  };

  return (
    <main className="animate-fadeIn">
      {/* Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs text-textMuted font-semibold uppercase tracking-wide">{course.code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{course.name}</h1>
          <p className="text-textMuted text-sm mt-1">
            {completedCount}/{courseAssignments.length} assignments completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleGroupPanel}
            className={`btn flex items-center gap-2 text-sm transition-all duration-300 ${
              showGroupPanel 
              ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(111,97,235,0.4)]" 
              : "hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4" /> My Group
          </button>
          <ProgressRing
            percent={courseAssignments.length === 0 ? 0 : Math.round((completedCount / courseAssignments.length) * 100)}
            size={44}
            stroke={3.5}
            colorClass="text-primary"
          />
        </div>
      </div>

      {/* Group Panel (collapsible) */}
      {showGroupPanel && (
        <GroupPanel
          course={course}
          db={db}
          currentUser={currentUser}
          myGroup={myGroup}
          createGroup={createGroup}
          joinGroup={joinGroup}
          leaveGroup={leaveGroup}
          changeGroupLeader={changeGroupLeader}
          removeGroupMember={removeGroupMember}
          addGroupMember={addGroupMember}
          isClosing={isClosingPanel}
          onClose={handleCloseGroupPanel}
          showToast={showToast}
        />
      )}

      {/* Assignment Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {courseAssignments.map((assignment, idx) => {
          const sub = getSubmission(assignment.id);
          const isOverdue = new Date(assignment.dueDate) < new Date();
          const hasReminder = notifications?.some(
            (n) => String(n.assignmentId) === String(assignment.id)
          );

          // Group-specific logic
          const isGroupAssignment = assignment.submissionType === "group";
          const isLeader = myGroup?.leaderId === currentUser.id || myGroup?.leaderId === String(currentUser.id);
          const groupSub = isGroupAssignment && myGroup
            ? db.submissions.find(
                (s) =>
                  String(s.assignmentId) === String(assignment.id) &&
                  (myGroup.memberIds.includes(Number(s.studentId)))
              )
            : null;

          return (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              submission={sub || groupSub}
              isOverdue={isOverdue}
              hasReminder={hasReminder}
              isGroupAssignment={isGroupAssignment}
              myGroup={myGroup}
              isLeader={isLeader}
              currentUser={currentUser}
              db={db}
              idx={idx}
              onAcknowledge={() => handleAcknowledge(assignment)}
            />
          );
        })}

        {courseAssignments.length === 0 && (
          <div className="col-span-full py-16 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Star className="w-8 h-8 text-textMuted/40" />
            </div>
            <p className="text-textMuted">No assignments posted yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* ── MODALS ──────────────────────────────────────────────── */}

      {/* Individual Confirm Modal */}
      {modalState === "confirm" && selectedAssignment && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center animate-modalIn border-white/10">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Confirm Acknowledgment</h2>
            <p className="text-textMuted text-sm mb-1">You are confirming submission for:</p>
            <p className="text-white font-semibold text-sm mb-5">"{selectedAssignment.title}"</p>
            <p className="text-xs text-textMuted mb-5 bg-black/20 p-3 rounded-xl border border-white/5">
              By clicking <strong className="text-white">Yes, I have submitted</strong>, you confirm that you have uploaded your work via the provided OneDrive link.
              <br /><br />
              <span className="text-primary font-medium">Timestamp will be recorded: {new Date().toLocaleString()}</span>
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="btn btn-primary w-full py-3 font-bold"
                onClick={confirmIndividual}
              >
                ✅ Yes, I have submitted
              </button>
              <button
                className="btn w-full text-textMuted hover:text-white hover:bg-white/5 border-none"
                onClick={() => { setModalState("none"); setSelectedAssignment(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Group Confirm Modal */}
      {modalState === "group-confirm" && selectedAssignment && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center animate-modalIn border-warning/20">
            <div className="w-14 h-14 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-warning/30">
              <Users className="w-7 h-7 text-warning" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Group Acknowledgment</h2>
            <p className="text-textMuted text-sm mb-4">
              As group leader of <strong className="text-white">{myGroup?.name}</strong>, you are acknowledging submission for all {myGroup?.memberIds?.length} members.
            </p>
            <div className="bg-black/20 rounded-xl p-3 mb-5 border border-white/5 text-left">
              <p className="text-xs text-textMuted mb-2 uppercase tracking-wide font-bold">Members covered:</p>
              <div className="flex flex-wrap gap-1.5">
                {myGroup?.memberIds.map((id) => {
                  const member = db.users.find((u) => String(u.id) === String(id));
                  return member ? (
                    <span key={id} className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">
                      {member.name.split(" ")[0]}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="btn w-full py-3 font-bold bg-warning hover:bg-warning/80 text-black border-none"
                onClick={confirmGroup}
              >
                ✅ Acknowledge for Group
              </button>
              <button
                className="btn w-full text-textMuted hover:text-white hover:bg-white/5 border-none"
                onClick={() => { setModalState("none"); setSelectedAssignment(null); }}
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
          <FileCheck className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg.text}</span>
        </div>,
        document.body
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// ASSIGNMENT CARD
// ─────────────────────────────────────────────
function AssignmentCard({
  assignment, submission, isOverdue, hasReminder,
  isGroupAssignment, myGroup, isLeader, currentUser, db, idx,
  onAcknowledge,
}) {
  const isSubmitted = !!submission;

  // Determine button state
  const canLeaderAcknowledge = isGroupAssignment && isLeader && !isSubmitted && !isOverdue;
  const memberWaiting = isGroupAssignment && myGroup && !isLeader && !isSubmitted;
  const noGroup = isGroupAssignment && !myGroup;
  const canIndividualAcknowledge = !isGroupAssignment && !isSubmitted && !isOverdue;

  const dueDate = new Date(assignment.dueDate);
  const formattedDue = dueDate.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const formattedTime = dueDate.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-cardHover relative overflow-hidden animate-slideUp"
      style={{ animationDelay: `${idx * 0.08}s` }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-[-40px] right-[-40px] w-48 h-48 opacity-25 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${
            isSubmitted ? "#10b981" : hasReminder ? "#ef4444" : "#8b5cf6"
          } 0%, transparent 70%)`,
        }}
      />

      {/* Urgent Badge */}
      {hasReminder && !isSubmitted && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-danger text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-lg shadow-danger/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            REMINDER
          </div>
        </div>
      )}

      {/* Status + Due date */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`status-badge flex items-center gap-1 ${
            isSubmitted ? "status-submitted" :
            isOverdue ? "bg-danger/10 text-danger border-danger/20" :
            "status-pending"
          }`}>
            {isSubmitted ? <><CheckCircle className="w-3 h-3" /> Acknowledged</> :
             isOverdue ? "Deadline Passed" : "Pending"}
          </span>
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
            isGroupAssignment
              ? "bg-warning/10 text-warning border-warning/20"
              : "bg-primary/10 text-primary border-primary/20"
          }`}>
            {isGroupAssignment ? "Group" : "Individual"}
          </span>
        </div>
        <div className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 ${
          isOverdue && !isSubmitted ? "text-danger" : "text-textMuted"
        }`}>
          <Clock className="w-3 h-3" />
          {formattedDue} · {formattedTime}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 relative z-10 leading-tight">
        {assignment.title}
      </h3>
      <p className="text-xs sm:text-sm text-textMuted mb-4 flex-grow relative z-10 leading-relaxed">
        {assignment.description}
      </p>

      {/* Grade + Feedback */}
      {submission?.grade && (
        <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 relative z-10 animate-fadeIn">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-success bg-success/20 px-2 py-0.5 rounded">
              Grade: {submission.grade}
            </span>
          </div>
          {submission.feedback && (
            <p className="text-[11px] text-white/70 italic leading-relaxed">
              "{submission.feedback}"
            </p>
          )}
        </div>
      )}

      {/* Submission timestamp */}
      {isSubmitted && (
        <div className="mb-3 flex items-center gap-1.5 relative z-10">
          <Clock className="w-3 h-3 text-success/70" />
          <span className="text-[10px] text-success/70">
            Acknowledged {new Date(submission.timestamp).toLocaleString()}
            {submission.submittedBy && submission.submittedBy !== currentUser.id &&
              ` · by ${db.users.find(u => String(u.id) === String(submission.submittedBy))?.name?.split(" ")[0] || "Leader"}`
            }
          </span>
        </div>
      )}

      {/* OneDrive Link */}
      {assignment.driveLink && (
        <a
          href={assignment.driveLink}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5 mb-4 font-medium bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 relative z-10 w-fit"
        >
          <FileText className="w-3.5 h-3.5" /> Open OneDrive Link
        </a>
      )}

      {/* Group Info */}
      {isGroupAssignment && myGroup && (
        <div className="mb-3 relative z-10 bg-black/20 px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-warning shrink-0" />
          <span className="text-xs text-textMuted">
            {myGroup.name}
            {isLeader && <span className="ml-1 text-warning font-bold">(You are Leader)</span>}
          </span>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-auto pt-3 border-t border-white/10 relative z-10">
        {/* Already submitted */}
        {isSubmitted && (
          <div className="btn w-full flex justify-center items-center gap-2 bg-success/10 text-success border-success/20 cursor-default">
            <CheckCircle className="w-4 h-4" /> Acknowledged
          </div>
        )}

        {/* Individual submit */}
        {canIndividualAcknowledge && (
          <button
            className="btn btn-primary w-full flex justify-center items-center gap-2 font-bold"
            onClick={onAcknowledge}
          >
            <UploadCloud className="w-4 h-4" /> Yes, I have submitted
          </button>
        )}

        {/* Group leader acknowledge */}
        {canLeaderAcknowledge && (
          <button
            className="btn w-full flex justify-center items-center gap-2 font-bold bg-warning hover:bg-warning/80 text-black border-none"
            onClick={onAcknowledge}
          >
            <Crown className="w-4 h-4" /> Acknowledge for Group
          </button>
        )}

        {/* Group member (not leader) — waiting */}
        {memberWaiting && !isOverdue && (
          <div className="text-center py-2 text-xs text-textMuted flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Waiting for your group leader to acknowledge…
          </div>
        )}

        {/* No group */}
        {noGroup && !isSubmitted && !isOverdue && (
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs text-warning flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>You are not part of any group. <strong>Form or join one</strong> using "My Group" to submit this assignment.</span>
          </div>
        )}

        {/* Overdue + not submitted */}
        {isOverdue && !isSubmitted && (
          <button
            className="btn w-full flex justify-center items-center gap-2 bg-danger/10 text-danger border-danger/20 cursor-not-allowed opacity-80"
            disabled
          >
            <Clock className="w-4 h-4" /> Deadline Passed
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GROUP PANEL
// ─────────────────────────────────────────────
function GroupPanel({ course, db, currentUser, myGroup, createGroup, joinGroup, leaveGroup, changeGroupLeader, removeGroupMember, addGroupMember, isClosing, onClose, showToast }) {
  const [mode, setMode] = useState(myGroup ? "view" : "options"); // view | create | join | options | addMember
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState(null);

  const allCourseGroups = (db.groups || []).filter((g) => g.courseId === course.id);
  const availableGroups = allCourseGroups.filter(
    (g) =>
      !g.memberIds.includes(currentUser.id) &&
      !g.memberIds.includes(String(currentUser.id))
  );

  const studentsInGroups = allCourseGroups.flatMap(g => g.memberIds).map(Number);
  const allEnrolledIds = db.enrollments.filter(e => e.courseId === course.id).map(e => Number(e.studentId));
  const availableStudentIds = allEnrolledIds.filter(id => !studentsInGroups.includes(id) && Number(id) !== Number(currentUser.id));
  const availableStudents = availableStudentIds.map(id => db.users.find(u => Number(u.id) === id)).filter(Boolean);

  const handleCreate = () => {
    if (!groupName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      createGroup(course.id, groupName.trim(), currentUser.id);
      setLoading(false);
      if (showToast) showToast(`Group "${groupName.trim()}" created!`);
      setMode("view");
    }, 400);
  };

  const handleJoin = (groupId) => {
    setLoading(true);
    setTimeout(() => {
      joinGroup(groupId);
      setLoading(false);
      setMode("view");
    }, 400);
  };

  const handleLeave = () => {
    setConfirmState({ type: "leave", name: "" });
  };

  return (
    <div className={`glass-panel rounded-2xl p-4 sm:p-5 mb-5 border-white/10 relative overflow-hidden ${isClosing ? "animate-slideUpOut" : "animate-slideDown"}`}>
      
      {/* Confirmation Overlay */}
      {confirmState && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 p-5 text-center animate-fadeIn">
          <AlertCircle className="w-10 h-10 text-warning mb-3 opacity-90" />
          <h3 className="text-white font-semibold text-lg mb-1">Are you sure?</h3>
          <p className="text-sm text-textMuted mb-6 px-2">
            {confirmState.type === "remove" 
              ? `You are about to remove ${confirmState.name} from the group.` 
              : confirmState.type === "leave"
              ? "You are about to leave this group. You will lose access to its submissions."
              : confirmState.type === "join"
              ? `Are you sure you want to join "${confirmState.name}"?`
              : `You are transferring leadership to ${confirmState.name}. You will become a regular member.`}
          </p>
          <div className="flex gap-3 w-full max-w-[200px]">
            <button className="btn flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2" onClick={() => setConfirmState(null)}>Cancel</button>
            <button 
              className={`btn flex-1 text-xs py-2 ${(confirmState.type === "remove" || confirmState.type === "leave") ? "text-danger border-danger/50 hover:bg-danger/20" : confirmState.type === "join" ? "text-white bg-primary hover:bg-primary/90 border-none px-0" : "text-black bg-warning hover:bg-warning/90 border-none px-0"}`}
              onClick={() => {
                if (confirmState.type === "remove") {
                  removeGroupMember(myGroup.id, confirmState.id);
                  if (showToast) showToast(`Removed ${confirmState.name} from the group.`, "warning");
                } else if (confirmState.type === "leave") {
                  leaveGroup(myGroup.id);
                  if (showToast) showToast("You left the group.", "warning");
                  setMode("options");
                } else if (confirmState.type === "join") {
                  joinGroup(confirmState.id);
                  if (showToast) showToast(`Successfully joined ${confirmState.name}!`);
                  setMode("view");
                } else {
                  changeGroupLeader(myGroup.id, confirmState.id);
                  if (showToast) showToast(`Transferred leadership to ${confirmState.name}.`);
                }
                setConfirmState(null);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-textMuted hover:text-white p-1"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-warning" />
        <h3 className="font-bold text-white text-sm">Group Management — {course.name}</h3>
      </div>

      {/* Viewing own group */}
      {myGroup && mode === "view" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-white">{myGroup.name}</p>
              <p className="text-xs text-textMuted">{myGroup.memberIds.length} members</p>
            </div>
            {(String(myGroup.leaderId) === String(currentUser.id)) && (
              <span className="text-[10px] bg-warning/15 text-warning border border-warning/30 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" /> Leader
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {myGroup.memberIds.map((id) => {
              const member = db.users.find((u) => String(u.id) === String(id));
              const isLead = String(myGroup.leaderId) === String(id);
              const currentUserIsLead = String(myGroup.leaderId) === String(currentUser.id);
              return member ? (
                <div key={id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-full border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {member.avatar}
                    </div>
                    <span className="text-sm text-white">{member.name.split(" ")[0]}</span>
                  </div>
                  {isLead ? (
                     <Crown className="w-4 h-4 text-warning" />
                  ) : currentUserIsLead ? (
                    <div className="flex items-center gap-1">
                       <button 
                          onClick={() => setConfirmState({ type: "leader", id, name: member.name.split(" ")[0] })}
                          className="text-[10px] bg-white/10 hover:bg-warning/20 text-textMuted hover:text-warning px-2 py-1 rounded-md transition-all border border-transparent hover:border-warning/30 font-semibold"
                       >
                         Make Leader
                       </button>
                       <button 
                          onClick={() => setConfirmState({ type: "remove", id, name: member.name.split(" ")[0] })}
                          className="text-[10px] bg-white/10 hover:bg-danger/20 text-textMuted hover:text-danger px-2 py-1 rounded-md transition-all border border-transparent hover:border-danger/30 font-semibold flex items-center justify-center p-1"
                          title="Remove Member"
                       >
                         <X className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  ) : null}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleLeave}
              className="btn text-xs flex items-center gap-1.5 text-danger hover:bg-danger/10 border-danger/20 flex-1 justify-center py-2"
            >
              <LeaveIcon className="w-3.5 h-3.5" /> Leave
            </button>
            {String(myGroup.leaderId) === String(currentUser.id) && (
              <button
                onClick={() => setMode("addMember")}
                className="btn text-xs flex items-center gap-1.5 text-primary hover:bg-primary/10 border-primary/20 flex-1 justify-center py-2"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Member
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add member list */}
      {mode === "addMember" && myGroup && (
        <div className="animate-fadeIn">
          {availableStudents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-textMuted">No unassigned students available.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {availableStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-black/20 px-3 py-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {s.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary text-xs px-3 py-1.5"
                    onClick={() => {
                        addGroupMember(myGroup.id, s.id);
                        if (showToast) showToast(`Added ${s.name.split(" ")[0]} to the group.`);
                        setMode("view");
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className="btn w-full mt-2 text-xs hover:bg-white/5 border-none text-textMuted"
            onClick={() => setMode("view")}>← Back</button>
        </div>
      )}

      {/* No group — choose to create or join */}
      {!myGroup && mode === "options" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("create")}
            className="btn flex flex-col items-center gap-2 py-4 hover:border-primary/40 hover:bg-primary/10"
          >
            <UserPlus className="w-5 h-5 text-primary" />
            <span className="text-xs">Create Group</span>
          </button>
          <button
            onClick={() => setMode("join")}
            className="btn flex flex-col items-center gap-2 py-4 hover:border-success/40 hover:bg-success/10"
          >
            <Users className="w-5 h-5 text-success" />
            <span className="text-xs">Join Group</span>
          </button>
        </div>
      )}

      {/* Create group form */}
      {mode === "create" && (
        <div className="space-y-3">
          <input
            type="text"
            className="input-field text-sm"
            placeholder="Group name e.g. Team Alpha"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn flex-1 text-sm hover:bg-white/10"
              onClick={() => setMode("options")}>Back</button>
            <button
              className="btn btn-primary flex-1 text-sm"
              onClick={handleCreate}
              disabled={!groupName.trim() || loading}
            >
              {loading ? "Creating…" : "Create & Lead"}
            </button>
          </div>
        </div>
      )}

      {/* Join group list */}
      {mode === "join" && (
        <div>
          {availableGroups.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-textMuted">No groups available to join.</p>
              <button className="text-xs text-primary mt-2 hover:underline" onClick={() => setMode("create")}>
                Create your own group →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {availableGroups.map((g) => {
                const leader = db.users.find((u) => String(u.id) === String(g.leaderId));
                return (
                  <div key={g.id} className="flex items-center justify-between bg-black/20 px-3 py-2.5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{g.name}</p>
                      <p className="text-[10px] text-textMuted">{g.memberIds.length} members · Led by {leader?.name?.split(" ")[0]}</p>
                    </div>
                    <button
                      className="btn btn-primary text-xs px-3 py-1.5"
                      onClick={() => setConfirmState({ type: "join", id: g.id, name: g.name })}
                      disabled={loading}
                    >
                      Join
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <button className="btn w-full mt-3 text-xs hover:bg-white/5 border-none text-textMuted"
            onClick={() => setMode("options")}>← Back</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENT ACTIVITY FEED WIDGET
// ─────────────────────────────────────────────
function StudentActivityFeed({ db, currentUser }) {
  // Use the centralized activity log filtered for the current user
  const userActivities = (db.activityLog || []).filter(
    (a) => String(a.userId) === String(currentUser.id)
  );

  // Take top 10 activities
  const displayedActivities = userActivities.slice(0, 10);

  const getActivityIcon = (type) => {
    switch (type) {
      case "submission":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "grade":
        return <Star className="w-4 h-4 text-success" />;
      case "group":
        return <Users className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "submission":
        return "bg-primary/10 border-primary/20 text-primary";
      case "grade":
        return "bg-success/10 border-success/20 text-success";
      case "group":
        return "bg-warning/10 border-warning/20 text-warning";
      default:
        return "bg-primary/10 border-primary/20 text-primary";
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 animate-slideUp h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-white text-base">Activity Feed</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-textMuted mb-1">No recent activity.</p>
            <p className="text-[11px] text-textMuted/60 px-4 leading-relaxed">
              Assignments you submit and group actions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-2">
            {displayedActivities.map((ev, idx) => (
              <div key={ev.id} className="flex gap-4 relative animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* Line connector */}
                {idx !== displayedActivities.length - 1 && (
                  <div className="absolute left-[15px] top-[34px] bottom-[-24px] w-[2px] bg-white/5" />
                )}
                
                <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 border ${getActivityColor(ev.type)} z-10 bg-surface shadow-lg`}>
                  {getActivityIcon(ev.type)}
                </div>
                
                <div className="pt-1.5 pb-2 min-w-0 flex-1">
                  <p className="text-sm font-bold text-white leading-tight mb-1">{ev.title}</p>
                  <div className="flex flex-col gap-1.5">
                     <p className="text-[11px] text-textMuted/90 leading-relaxed font-medium">
                       {ev.desc}
                     </p>
                     <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                       {(new Date().getTime() - new Date(ev.timestamp).getTime()) < 86400000 
                         ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                         : new Date(ev.timestamp).toLocaleDateString()
                       }
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
