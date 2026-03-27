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

  const addSubmission = (studentId, assignmentId) => {
    setDb(prev => ({
      ...prev,
      submissions: [...prev.submissions, { studentId, assignmentId, status: 'submitted', timestamp: new Date().toISOString() }]
    }));
  };

  return (
    <div className="relative min-h-screen font-sans text-textMain bg-bgBase overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="dashboard-layout animate-fadeIn container mx-auto px-4 py-8">
          <header className="glass-panel rounded-xl flex justify-between items-center px-6 py-4 mb-8 animate-slideDown shadow-lg">
            <div className="flex items-center gap-3">
              <Layers className="text-primary w-6 h-6" />
              <h2 className="font-bold text-xl tracking-tight">Eazy<span className="text-primary">Assign</span></h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 pr-3 rounded-full glass-panel-light">
                <div className="w-8 h-8 bg-primary text-white flex justify-center items-center rounded-full font-bold text-xs shadow-glow">
                  {currentUser.avatar}
                </div>
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className={`text-xs px-2 py-1 rounded bg-surface/50 font-semibold ${currentUser.role === 'admin' ? 'text-warning' : 'text-textMuted'}`}>
                  {currentUser.role === 'admin' ? 'Professor' : 'Student'}
                </span>
              </div>
              <button onClick={handleLogout} className="icon-btn" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          {currentUser.role === 'admin' ? (
            <AdminDashboard db={db} currentUser={currentUser} addAssignment={addAssignment} />
          ) : (
            <StudentDashboard db={db} currentUser={currentUser} addSubmission={addSubmission} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
