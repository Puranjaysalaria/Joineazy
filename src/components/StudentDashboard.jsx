import React, { useState } from 'react';
import { Clock, CheckCircle, ExternalLink, Check, UploadCloud } from 'lucide-react';

export default function StudentDashboard({ db, currentUser, addSubmission }) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalState, setModalState] = useState('none'); // 'none', 'confirm', 'success'
  const [fileAttached, setFileAttached] = useState(false);

  const assignmentsWithStatus = db.assignments.map(a => {
    const isSubmitted = db.submissions.some(s => s.assignmentId === a.id && s.studentId === currentUser.id);
    return { ...a, isSubmitted };
  });

  const completedCount = assignmentsWithStatus.filter(a => a.isSubmitted).length;
  const totalCount = assignmentsWithStatus.length;

  const handleInitiate = (assignment) => {
    setSelectedAssignment(assignment);
    setModalState('confirm');
  };

  const handleConfirm = () => {
    addSubmission(currentUser.id, selectedAssignment.id);
    setModalState('success');
  };

  const handleClose = () => {
    setModalState('none');
    setTimeout(() => {
      setSelectedAssignment(null);
      setFileAttached(false);
    }, 300); // cleanup after animation
  };

  return (
    <main className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">My Assignments</h1>
          <p className="text-textMuted text-sm md:text-base">Track and submit your pending work.</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-lg text-sm shadow-sm border-white/10">
          <span><strong className="text-white text-base">{completedCount}</strong> / {totalCount} Completed</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {assignmentsWithStatus.map((assignment, idx) => (
          <div key={assignment.id} 
               className="glass-panel p-6 rounded-xl animate-slideUp flex flex-col border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-cardHover"
               style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex justify-between items-start mb-4">
              <span className={`status-badge flex items-center gap-1 ${assignment.isSubmitted ? 'status-submitted' : 'status-pending'}`}>
                {assignment.isSubmitted ? <><CheckCircle className="w-3.5 h-3.5" /> Submitted</> : 'Pending'}
              </span>
              <span className="text-xs text-textMuted flex items-center gap-1 font-medium bg-black/20 px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" /> {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-white">{assignment.title}</h3>
            <p className="text-sm text-textMuted mb-4 flex-grow">{assignment.description}</p>
            
            {assignment.driveLink && (
              <a href={assignment.driveLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:text-primaryHover transition-colors flex items-center gap-1 mb-5 w-max font-medium bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20">
                <ExternalLink className="w-4 h-4" /> Supporting Materials
              </a>
            )}
            
            <div className="mt-auto pt-4 border-t border-white/10">
              {assignment.isSubmitted ? (
                <button className="btn w-full btn-success flex justify-center items-center gap-2 cursor-default opacity-90" disabled>
                  <Check className="w-4 h-4" /> Completed
                </button>
              ) : (
                <button className="btn btn-primary w-full flex justify-center items-center gap-2" onClick={() => handleInitiate(assignment)}>
                  <UploadCloud className="w-5 h-5" /> Submit Work
                </button>
              )}
            </div>
          </div>
        ))}
        {totalCount === 0 && <p className="text-textMuted col-span-full py-8 text-center text-lg">You have no active assignments.</p>}
      </div>

      {/* Double Verification Modals */}
      {modalState !== 'none' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          
          {modalState === 'confirm' && selectedAssignment && (
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 text-center animate-modalIn shadow-2xl border-white/10">
              <div className="w-16 h-16 bg-surface rounded-full flex justify-center items-center mx-auto mb-5 border border-primary/50 shadow-glow">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Submit Assignment</h2>
              <p className="text-textMuted mb-6 text-sm leading-relaxed">
                Are you sure you want to submit your work for <strong className="text-white">"{selectedAssignment.title}"</strong>? This action will mark it as complete.
              </p>

              {/* File Attachment UI */}
              <div className="mb-8 text-left bg-black/20 p-4 rounded-xl border border-white/5">
                <label className="block text-sm font-medium mb-2 text-textMuted">Attach File (Optional)</label>
                <input 
                  type="file" 
                  onChange={(e) => setFileAttached(e.target.files.length > 0)}
                  className="block w-full text-sm text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer"
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <button className="btn px-6 hover:bg-white/10" onClick={handleClose}>Cancel</button>
                <button className="btn btn-primary px-6 hover-glow" onClick={handleConfirm}>
                  Yes, I have submitted
                </button>
              </div>
            </div>
          )}

          {modalState === 'success' && selectedAssignment && (
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 text-center animate-modalIn shadow-2xl border-white/10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex justify-center items-center mx-auto mb-5 border border-success/50 shadow-successGlow relative">
                <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-20"></div>
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Success!</h2>
              <p className="text-textMuted mb-8 text-sm">
                Your work for "{selectedAssignment.title}" has been recorded successfully.
              </p>
              <button className="btn btn-success px-10" onClick={handleClose}>Done</button>
            </div>
          )}

        </div>
      )}
    </main>
  );
}
