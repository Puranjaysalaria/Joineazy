import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import { Layers, LogOut } from 'lucide-react';

// Shared Mock Database
const INITIAL_DB = {
  users: [
    { id: 1, name: 'Alex Carter', role: 'student', avatar: 'AC' },
    { id: 2, name: 'Jordan Smith', role: 'student', avatar: 'JS' },
    { id: 3, name: 'Taylor Doe', role: 'student', avatar: 'TD' },
    { id: 100, name: 'Prof. Anderson', role: 'admin', avatar: 'PA' }
  ],
  assignments: [
    { id: 101, title: 'UX Research Case Study', description: 'Conduct a heuristic evaluation of a popular app.', dueDate: '2026-04-10', driveLink: 'https://drive.google.com/example-1', createdBy: 100, createdAt: new Date().toISOString() },
    { id: 102, title: 'Prototyping in Figma', description: 'Design high fidelity wireframes for the dashboard.', dueDate: '2026-04-15', driveLink: 'https://drive.google.com/example-2', createdBy: 100, createdAt: new Date().toISOString() }
  ],
  submissions: [
    { studentId: 1, assignmentId: 101, status: 'submitted', timestamp: new Date().toISOString() }
  ]
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Initialize mock DB from localStorage or fallback to INITIAL_DB
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('joineazy_db');
    return saved ? JSON.parse(saved) : INITIAL_DB;
  });

  // Utilize useEffect to persist data
  useEffect(() => {
    localStorage.setItem('joineazy_db', JSON.stringify(db));
  }, [db]);

  const handleLogin = (role, userId = 1) => {
    if (role === 'admin') {
      setCurrentUser(db.users.find(u => u.role === 'admin'));
    } else {
      setCurrentUser(db.users.find(u => u.id === userId));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addAssignment = (newAssignment) => {
    setDb(prev => ({
      ...prev,
      assignments: [...prev.assignments, { ...newAssignment, id: Date.now(), createdBy: currentUser.id, createdAt: new Date().toISOString() }]
    }));
  };

  const addSubmission = (assignmentId) => {
    setDb(prev => {
      // Filter out any existing submission for this assignment by this student to allow "Resubmit/Edit"
      const otherSubmissions = prev.submissions.filter(s => 
        !(String(s.assignmentId) === String(assignmentId) && String(s.studentId) === String(currentUser.id))
      );
      
      return {
        ...prev,
        submissions: [...otherSubmissions, { studentId: currentUser.id, assignmentId, status: 'submitted', timestamp: new Date().toISOString() }]
      };
    });
  };

  const removeAssignment = (assignmentId) => {
    setDb(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => String(a.id) !== String(assignmentId)),
      submissions: prev.submissions.filter(s => String(s.assignmentId) !== String(assignmentId))
    }));
  };

  return (
    <div className="relative min-h-screen font-sans text-textMain overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="dashboard-layout relative z-10 animate-fadeIn container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <header className="glass-panel rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6 py-4 mb-6 sm:mb-8 animate-slideDown shadow-lg">
            <div className="flex items-center gap-3">
              <Layers className="text-primary w-6 h-6" />
              <h2 className="font-bold text-lg sm:text-xl tracking-tight">Eazy<span className="text-primary">Assign</span></h2>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 p-1 pr-3 rounded-full glass-panel-light max-w-[200px] overflow-hidden">
                <div className="w-8 h-8 min-w-[32px] bg-primary text-white flex justify-center items-center rounded-full font-bold text-xs shadow-glow">
                  {currentUser.avatar}
                </div>
                <span className="text-sm font-medium truncate hidden md:inline-block">{currentUser.name}</span>
                <span className="text-sm font-medium truncate md:hidden">{currentUser.name.split(' ')[0]}</span>
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md font-bold ${currentUser.role === 'admin' ? 'bg-warning/20 text-warning border border-warning/20' : 'bg-white/10 text-white/70 border border-white/5'}`}>
                  {currentUser.role === 'admin' ? 'Prof' : 'Student'}
                </span>
              </div>
              <button onClick={handleLogout} className="icon-btn" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          {currentUser.role === 'admin' ? (
            <AdminDashboard db={db} currentUser={currentUser} addAssignment={addAssignment} removeAssignment={removeAssignment} />
          ) : (
            <StudentDashboard db={db} currentUser={currentUser} addSubmission={addSubmission} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
