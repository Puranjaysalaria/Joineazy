import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Calendar, Link, X, CheckCircle } from 'lucide-react';

export default function AdminDashboard({ db, currentUser, addAssignment }) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter assignments directly created by this admin
  const adminAssignments = db.assignments.filter(a => a.createdBy === currentUser.id);
  const students = db.users.filter(u => u.role === 'student');
  const totalStudents = students.length;
  const totalAssignments = adminAssignments.length;

  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', driveLink: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    addAssignment(formData);
    setFormData({ title: '', description: '', dueDate: '', driveLink: '' });
    setIsModalOpen(false);
    
    // Show success popup notification
    setToastMessage('Assignment created successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <main className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-textMuted text-sm md:text-base">Manage assignments and track student progress.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" /> New Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-panel flex gap-2 p-1 mb-8 rounded-lg w-max shadow-sm">
        <button 
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === 'assignments' ? 'bg-surfaceActive text-white' : 'text-textMuted hover:text-white'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button 
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === 'students' ? 'bg-surfaceActive text-white' : 'text-textMuted hover:text-white'}`}
          onClick={() => setActiveTab('students')}
        >
          Student Progress
        </button>
      </div>

      {/* Assignments View */}
      {activeTab === 'assignments' && (
        <div className="grid gap-6 grid-cols-1">
          {adminAssignments.map(assignment => {
            const submittedCount = db.submissions.filter(s => s.assignmentId === assignment.id && s.status === 'submitted').length;
            const progressPercent = totalStudents === 0 ? 0 : Math.round((submittedCount / totalStudents) * 100);

            return (
              <div key={assignment.id} className="glass-panel p-6 rounded-xl animate-slideUp border-white/5 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-cardHover">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-white">{assignment.title}</h3>
                    <p className="text-sm text-textMuted mb-3">{assignment.description}</p>
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      {assignment.driveLink && (
                        <span className="px-2 py-0.5 bg-surface rounded ml-2 flex items-center gap-1 border border-white/10">
                          <Link className="w-3.5 h-3.5" /> Drive Attached
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left md:text-right md:min-w-[150px]">
                    <div className="text-sm font-semibold mb-1 text-white">{submittedCount} / {totalStudents} Submitted</div>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 relative shadow-glow" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {adminAssignments.length === 0 && <p className="text-textMuted text-center py-8">No assignments created yet.</p>}
        </div>
      )}

      {/* Students View */}
      {activeTab === 'students' && (
        <div className="glass-panel rounded-xl overflow-hidden shadow-sm animate-slideUp">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-borderColor bg-black/20">
                  <th className="p-4 text-textMuted font-medium text-sm">Student</th>
                  <th className="p-4 text-textMuted font-medium text-sm">Progress</th>
                  <th className="p-4 text-textMuted font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  // Admin sees progress only regarding the assignments they created
                  const submittedCount = db.submissions.filter(s => 
                    s.studentId === student.id && adminAssignments.some(assign => assign.id === s.assignmentId)
                  ).length;
                  const progressPercent = totalAssignments === 0 ? 0 : Math.round((submittedCount / totalAssignments) * 100);

                  return (
                    <tr key={student.id} className="border-b border-borderColor/50 last:border-0 hover:bg-surfaceHover transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-white flex justify-center items-center rounded-full font-bold text-xs shadow-glow">{student.avatar}</div>
                          <span className="font-medium text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm w-10 font-medium">{progressPercent}%</span>
                          <div className="w-full max-w-[120px] h-2 bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-glow" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`status-badge ${progressPercent === 100 ? 'status-submitted' : 'status-pending'}`}>
                          {progressPercent === 100 ? 'Complete' : 'Pending'}
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

      {/* Add Assignment Modal - Rendered via Portal */}
      {isModalOpen && createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] p-4">
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
              <h2 className="text-2xl font-bold text-white">Create Assignment</h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-textMuted">Assignment Title *</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  placeholder="e.g. UX Research Study"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-textMuted">Description *</label>
                <textarea 
                  required
                  rows="3" 
                  className="input-field resize-none" 
                  placeholder="Describe the task..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-textMuted">Due Date *</label>
                  <input 
                    type="date" 
                    required
                    className="input-field w-full" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-textMuted flex items-center gap-1">
                    <Link className="w-3.5 h-3.5" /> Drive Link
                  </label>
                  <input 
                    type="url" 
                    className="input-field" 
                    placeholder="https://drive..."
                    value={formData.driveLink}
                    onChange={(e) => setFormData({...formData, driveLink: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-white/10 flex justify-end gap-3">
                <button type="button" className="btn hover:bg-white/10 px-6" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-8 hover-glow shadow-primaryGlow">Create</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div className="fixed bottom-6 right-6 bg-success/20 border border-success/50 text-success px-6 py-4 rounded-xl shadow-glow animate-slideUp z-[9999] flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{toastMessage}</span>
        </div>,
        document.body
      )}
    </main>
  );
}
