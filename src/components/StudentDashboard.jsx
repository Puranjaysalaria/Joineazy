import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UploadCloud, CheckCircle, FileText, Clock, FileCheck, Layout } from 'lucide-react';

export default function StudentDashboard({ db, currentUser, addSubmission }) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalState, setModalState] = useState('none'); // 'none', 'confirm'
  const [fileAttached, setFileAttached] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
    addSubmission(selectedAssignment.id);
    setModalState('none');
    setTimeout(() => {
      setSelectedAssignment(null);
      setFileAttached(false);
    }, 300);
    
    // Show success popup notification
    setToastMessage(`"${selectedAssignment.title}" submitted successfully!`);
    setTimeout(() => setToastMessage(''), 3500);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 animate-slideDown">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
          <p className="text-textMuted text-sm md:text-base">You have <span className="text-primary font-bold">{totalCount - completedCount} tasks</span> remaining for this week.</p>
        </div>
        <div className="glass-panel p-4 rounded-xl shadow-lg border-white/10 flex items-center gap-4 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-4 border-surface/50 relative flex items-center justify-center">
             <div className="absolute inset-0 border-4 border-primary rounded-full" style={{ clipPath: `inset(0 ${100 - (completedCount / (totalCount || 1)) * 100}% 0 0)` }}></div>
             <span className="text-xs font-bold">{Math.round((completedCount / (totalCount || 1)) * 100)}%</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Course Progress</div>
            <div className="text-xs text-textMuted">{completedCount} of {totalCount} Completed</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {assignmentsWithStatus.map((assignment, idx) => (
          <div key={assignment.id} 
               className="glass-panel p-6 rounded-xl animate-slideUp flex flex-col border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-cardHover relative overflow-hidden"
               style={{ animationDelay: `${idx * 0.1}s` }}>
            {/* Ambient Background Glow Effect (Radial Gradient prevents Webkit blur clipping bugs) */}
            <div 
              className="absolute top-[-50px] right-[-50px] w-64 h-64 opacity-30 pointer-events-none transition-colors duration-700 z-0"
              style={{ background: `radial-gradient(circle, ${assignment.isSubmitted ? '#10b981' : '#8b5cf6'} 0%, transparent 70%)` }}
            ></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
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
                <FileText className="w-4 h-4" /> Supporting Materials
              </a>
            )}
            
            <div className="mt-auto pt-4 border-t border-white/10">
              {assignment.isSubmitted ? (
                <button className="btn w-full btn-success flex justify-center items-center gap-2 cursor-default opacity-90" disabled>
                  <CheckCircle className="w-4 h-4" /> Completed
                </button>
              ) : (
                <button className="btn btn-primary w-full flex justify-center items-center gap-2" onClick={() => handleInitiate(assignment)}>
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
            <h3 className="text-xl font-bold text-white mb-2">Everything's Clear!</h3>
            <p className="text-textMuted max-w-xs">No assignments have been posted yet. Enjoy your free time or check back later.</p>
          </div>
        )}
      </div>

      {/* Double Verification Modals - Rendered via Portal to escape CSS bounding boxes */}
      {modalState !== 'none' && createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
          
          {modalState === 'confirm' && selectedAssignment && (
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 text-center animate-modalIn shadow-4xl border-white/10 relative">
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
                  className="block w-full text-sm text-textMuted file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary file:transition-all file:duration-300 hover:file:bg-primary hover:file:text-white hover:file:shadow-glow active:file:scale-95 file:cursor-pointer cursor-pointer"
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
        </div>,
        document.body
      )}

      {/* Toast Notification Pop-up - Rendered via Portal */}
      {toastMessage && createPortal(
        <div className="fixed bottom-6 right-6 bg-success/20 border border-success/50 text-success px-6 py-4 rounded-xl shadow-glow animate-slideUp z-[9999] flex items-center gap-3">
          <FileCheck className="w-6 h-6" />
          <span className="font-semibold">{toastMessage}</span>
        </div>,
        document.body
      )}
    </main>
  );
}
