import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import ProfDashboard from "./components/ProfDashboard";
import StudentDashboard from "./components/StudentDashboard";
import { Layers, LogOut, ChevronLeft } from "lucide-react";

// ── Schema version: bump this whenever INITIAL_DB structure changes ──
const DB_VERSION = "2.4.0";

// ============================================================
// INITIAL MOCK DATABASE
// ============================================================
const INITIAL_DB = {
  users: [
    { id: 1, name: "Alex Carter", role: "student", avatar: "AC", email: "alex@student.com", password: "password123" },
    { id: 2, name: "Jordan Smith", role: "student", avatar: "JS", email: "jordan@student.com", password: "password123" },
    { id: 3, name: "Taylor Doe", role: "student", avatar: "TD", email: "taylor@student.com", password: "password123" },
    { id: 4, name: "Morgan Lee", role: "student", avatar: "ML", email: "morgan@student.com", password: "password123" },
    { id: 5, name: "Casey Rivers", role: "student", avatar: "CR", email: "casey@student.com", password: "password123" },
    { id: 6, name: "Peyton West", role: "student", avatar: "PW", email: "peyton@student.com", password: "password123" },
    { id: 100, name: "Prof. Anderson", role: "admin", avatar: "PA", email: "admin@prof.com", password: "admin123" },
  ],

  courses: [
    {
      id: "c1",
      name: "UI/UX Design Fundamentals",
      code: "UXD101",
      profId: 100,
      description: "Master the principles of user-centered design and create stunning digital experiences.",
      color: "primary",
      semester: "Spring 2026",
    },
    {
      id: "c2",
      name: "Frontend Development",
      code: "FED201",
      profId: 100,
      description: "Build modern, responsive web applications using React.js and Tailwind CSS.",
      color: "success",
      semester: "Spring 2026",
    },
    {
      id: "c3",
      name: "Design Systems",
      code: "DS301",
      profId: 100,
      description: "Learn to build scalable, consistent design systems and component libraries.",
      color: "warning",
      semester: "Spring 2026",
    },
  ],

  enrollments: [
    { studentId: 1, courseId: "c1" },
    { studentId: 1, courseId: "c2" },
    { studentId: 2, courseId: "c1" },
    { studentId: 2, courseId: "c3" },
    { studentId: 3, courseId: "c1" },
    { studentId: 3, courseId: "c2" },
    { studentId: 4, courseId: "c1" },
    { studentId: 4, courseId: "c3" },
    { studentId: 5, courseId: "c2" },
    { studentId: 5, courseId: "c3" },
    { studentId: 6, courseId: "c1" },
    { studentId: 6, courseId: "c2" },
    { studentId: 6, courseId: "c3" },
  ],

  assignments: [
    {
      id: 101,
      courseId: "c1",
      title: "UX Research Case Study",
      description: "Conduct a heuristic evaluation of a popular app and document your findings with evidence-based recommendations.",
      dueDate: "2026-04-10T23:59:00",
      driveLink: "https://drive.google.com/example-1",
      submissionType: "individual",
      createdBy: 100,
      createdAt: new Date().toISOString(),
    },
    {
      id: 102,
      courseId: "c1",
      title: "Prototyping in Figma",
      description: "Design high fidelity wireframes for a mobile dashboard. Your group will present the prototype to the class.",
      dueDate: "2026-04-20T23:59:00",
      driveLink: "https://drive.google.com/example-2",
      submissionType: "group",
      createdBy: 100,
      createdAt: new Date().toISOString(),
    },
    {
      id: 103,
      courseId: "c2",
      title: "React Component Library",
      description: "Build a reusable component library with at least 10 components, documented with Storybook.",
      dueDate: "2026-04-25T23:59:00",
      driveLink: "https://drive.google.com/example-3",
      submissionType: "individual",
      createdBy: 100,
      createdAt: new Date().toISOString(),
    },
    {
      id: 104,
      courseId: "c2",
      title: "Full-Stack Todo App",
      description: "Build a full-stack todo application using React and a mock REST API. Include CRUD operations.",
      dueDate: "2026-04-18T23:59:00",
      driveLink: null,
      submissionType: "group",
      createdBy: 100,
      createdAt: new Date().toISOString(),
    },
    {
      id: 105,
      courseId: "c3",
      title: "Design Token Audit",
      description: "Audit an existing product's design tokens and propose a scalable token architecture.",
      dueDate: "2026-04-15T23:59:00",
      driveLink: "https://drive.google.com/example-5",
      submissionType: "individual",
      createdBy: 100,
      createdAt: new Date().toISOString(),
    },
  ],

  groups: [
    {
      id: "g1",
      courseId: "c1",
      name: "Team Alpha",
      leaderId: 1,
      memberIds: [1, 2, 3],
      createdAt: new Date().toISOString(),
    },
    {
      id: "g2",
      courseId: "c1",
      name: "Team Beta",
      leaderId: 4,
      memberIds: [4, 6],
      createdAt: new Date().toISOString(),
    },
    {
      id: "g3",
      courseId: "c2",
      name: "Code Squad",
      leaderId: 1,
      memberIds: [1, 3, 6],
      createdAt: new Date().toISOString(),
    },
  ],

  submissions: [
    {
      studentId: 1,
      assignmentId: 101,
      status: "submitted",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  notifications: [],
  activityLog: [],
};

// ============================================================
// APP COMPONENT
// ============================================================
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // SPA Router State inside dashboards
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'course'
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [db, setDb] = useState(() => {
    const savedVersion = localStorage.getItem("joineazy_db_version");
    const saved = localStorage.getItem("joineazy_db");

    if (!saved || savedVersion !== DB_VERSION) {
      localStorage.removeItem("joineazy_db");
      localStorage.setItem("joineazy_db_version", DB_VERSION);
      return INITIAL_DB;
    }

    return JSON.parse(saved);
  });

  // JWT Auth Simulation
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem("joineazy_jwt");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return db.users.find(u => String(u.id) === String(payload.userId)) || null;
      } catch (e) {
        return null; // Invalid token
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem("joineazy_db", JSON.stringify(db));
    localStorage.setItem("joineazy_db_version", DB_VERSION);
  }, [db]);

  // Keep mock JWT in sync
  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem("joineazy_jwt");
    } else {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ userId: currentUser.id, role: currentUser.role, exp: Date.now() + 86400000 }));
      const signature = "mock-signature";
      localStorage.setItem("joineazy_jwt", `${header}.${payload}.${signature}`);
    }
  }, [currentUser]);

  // Handle manual navigation redirects purely based on authorization
  useEffect(() => {
    if (currentUser && (location.pathname === '/' || location.pathname === '/login')) {
       navigate(currentUser.role === 'admin' ? '/professor' : '/student');
    }
  }, [currentUser, location, navigate]);

  const loginUser = (email, password) => {
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password.");
    setCurrentUser(user);
    navigate(user.role === 'admin' ? '/professor' : '/student');
    return user;
  };

  const registerUser = (name, email, password, role) => {
    if (db.users.find(u => u.email === email)) throw new Error("Email already registered.");
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "student",
      avatar: name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2) || "U"
    };

    // Handle intelligent auto-enrollments and course mappings for a realistic demo
    let newEnrollments = [...db.enrollments];
    let newCourses = [...db.courses];

    if (newUser.role === "student") {
      // Auto-enroll new students in all active courses so their dashboard isn't empty!
      const defaultEnrollments = db.courses.map(c => ({ studentId: newUser.id, courseId: c.id }));
      newEnrollments = [...newEnrollments, ...defaultEnrollments];
    } else if (newUser.role === "admin") {
      // If a new professor registers, clone the base courses (so they get the subjects)
      const clonedCourses = db.courses.filter(c => c.profId === 100).map(c => ({
        ...c,
        id: `c_${newUser.id}_${c.id}`,
        profId: newUser.id
      }));
      newCourses = [...newCourses, ...clonedCourses];

      // Clone assignments so the new professor's dashboard is fully populated
      const clonedAssignments = db.assignments.filter(a => a.createdBy === 100).map(a => ({
        ...a,
        id: Date.now() + Math.floor(Math.random() * 1000),
        courseId: `c_${newUser.id}_${a.courseId}`,
        createdBy: newUser.id
      }));
      const newAssignments = [...db.assignments, ...clonedAssignments];
      
      // Automatically enroll all existing students into these fresh, cloned courses
      const allStudents = db.users.filter(u => u.role === "student");
      const autoEnrollments = allStudents.flatMap(s => 
        clonedCourses.map(cc => ({ studentId: s.id, courseId: cc.id }))
      );
      newEnrollments = [...newEnrollments, ...autoEnrollments];
      
      const newDb = { ...db, users: [...db.users, newUser], enrollments: newEnrollments, courses: newCourses, assignments: newAssignments };
      setDb(newDb);
      setCurrentUser(newUser);
      navigate('/professor');
      return newUser;
    }

    const newDb = { ...db, users: [...db.users, newUser], enrollments: newEnrollments, courses: newCourses };
    setDb(newDb);
    
    setCurrentUser(newUser);
    navigate(newUser.role === 'admin' ? '/professor' : '/student');
    return newUser;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView("dashboard");
    setSelectedCourse(null);
    navigate('/login');
  };

  const navigateToCourse = (course) => {
    setSelectedCourse(course);
    setView("course");
  };

  const navigateToDashboard = () => {
    setSelectedCourse(null);
    setView("dashboard");
  };

  // ----------------------------------------------------------------
  // DB MUTATION FUNCTIONS
  // ----------------------------------------------------------------
  const updateDb = (partialState) => {
    setDb((prev) => ({ ...prev, ...partialState }));
  };

  const addAssignment = (assignment) => {
    updateDb({
      assignments: [
        ...db.assignments,
        {
          ...assignment,
          id: Date.now(),
          createdBy: currentUser.id,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  };

  const updateAssignment = (updatedAssignment) => {
    updateDb({
      assignments: db.assignments.map((a) =>
        String(a.id) === String(updatedAssignment.id) ? updatedAssignment : a
      ),
    });
  };

  const removeAssignment = (assignmentId) => {
    setDb((prev) => ({
      ...prev,
      assignments: prev.assignments.filter(
        (a) => String(a.id) !== String(assignmentId)
      ),
      submissions: prev.submissions.filter(
        (s) => String(s.assignmentId) !== String(assignmentId)
      ),
      notifications: prev.notifications.filter(
        (n) => String(n.assignmentId) !== String(assignmentId)
      ),
    }));
  };

  // Individual acknowledgment
  const addSubmission = (assignmentId) => {
    const assignment = db.assignments.find(a => String(a.id) === String(assignmentId));
    setDb((prev) => {
      const otherSubmissions = prev.submissions.filter(
        (s) =>
          !(
            String(s.assignmentId) === String(assignmentId) &&
            String(s.studentId) === String(currentUser.id)
          )
      );
      return {
        ...prev,
        submissions: [
          ...otherSubmissions,
          {
            studentId: currentUser.id,
            assignmentId,
            status: "submitted",
            timestamp: new Date().toISOString(),
          },
        ],
        notifications: prev.notifications.filter(
          (n) =>
            !(
              String(n.assignmentId) === String(assignmentId) &&
              String(n.userId) === String(currentUser.id)
            )
        ),
      };
    });
    logActivity("submission", `Submitted Assignment`, `You completed ${assignment?.title || "an assignment"}`);
  };

  // Group acknowledgment — leader acknowledges → marks all group members
  const addGroupSubmission = (assignmentId, courseId) => {
    const assignment = db.assignments.find(a => String(a.id) === String(assignmentId));
    setDb((prev) => {
      const group = (prev.groups || []).find(
        (g) =>
          g.courseId === courseId &&
          (g.memberIds.includes(currentUser.id) ||
            g.memberIds.includes(String(currentUser.id)))
      );

      if (!group) return prev;

      const memberIds = group.memberIds.map(Number);

      // Remove existing submissions for these students + this assignment
      const otherSubmissions = prev.submissions.filter(
        (s) =>
          !(
            String(s.assignmentId) === String(assignmentId) &&
            memberIds.includes(Number(s.studentId))
          )
      );

      const groupSubmissions = memberIds.map((memberId) => ({
        studentId: memberId,
        assignmentId,
        status: "submitted",
        timestamp: new Date().toISOString(),
        submittedBy: currentUser.id, // track who acknowledged
        groupId: group.id,
      }));

      // Clear notifications for all group members
      const otherNotifications = prev.notifications.filter(
        (n) =>
          !(
            String(n.assignmentId) === String(assignmentId) &&
            memberIds.includes(Number(n.userId))
          )
      );

      // Generate activity logs for all members in one go
      const now = new Date().toISOString();
      const newActivities = memberIds.map(id => ({
        id: Date.now() + Math.random(),
        userId: id,
        type: "submission",
        title: "Group Submission",
        desc: `Your team submitted ${assignment?.title || "an assignment"}`,
        timestamp: now
      }));

      return {
        ...prev,
        submissions: [...otherSubmissions, ...groupSubmissions],
        notifications: otherNotifications,
        activityLog: [...newActivities, ...(prev.activityLog || [])].slice(0, 150)
      };
    });
  };

  const updateSubmission = (assignmentId, studentId, grade, feedback) => {
    setDb((prev) => ({
      ...prev,
      submissions: prev.submissions.map((s) =>
        String(s.assignmentId) === String(assignmentId) &&
        String(s.studentId) === String(studentId)
          ? { ...s, status: "reviewed", grade, feedback, reviewedAt: new Date().toISOString() }
          : s
      ),
      activityLog: [
        {
          id: Date.now() + Math.random(),
          userId: studentId,
          type: "grade",
          title: `Grade Received`,
          desc: `You received a ${grade} for an assignment.`,
          timestamp: new Date().toISOString()
        },
        ...(prev.activityLog || [])
      ]
    }));
  };

  const sendNotification = (userId, assignmentId, message) => {
    setDb((prev) => ({
      ...prev,
      notifications: [
        ...prev.notifications,
        {
          id: Date.now(),
          userId,
          assignmentId,
          message,
          type: "reminder",
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  // Activity Logger helper
  const logActivity = (type, title, desc, targetUserId = null) => {
    const idToLog = targetUserId || currentUser.id;
    setDb((prev) => ({
      ...prev,
      activityLog: [
          {
              id: Date.now() + Math.random(),
              userId: idToLog,
              type,
              title,
              desc,
              timestamp: new Date().toISOString()
          },
          ...(prev.activityLog || [])
      ].slice(0, 100) // increase limit for multi-user logs
    }));
  };

  // Group management
  const createGroup = (courseId, groupName) => {
    const newGroupId = `g${Date.now()}`;
    const newGroup = {
      id: newGroupId,
      courseId,
      name: groupName,
      leaderId: currentUser.id,
      memberIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };
    updateDb({ groups: [...(db.groups || []), newGroup] });
    logActivity("group", "Created Group", `You created and joined ${groupName}`);
  };

  const joinGroup = (groupId) => {
    const group = (db.groups || []).find(g => g.id === groupId);
    if (!group) return;
    
    updateDb({
      groups: (db.groups || []).map((g) =>
        g.id === groupId && !g.memberIds.includes(currentUser.id)
          ? { ...g, memberIds: [...g.memberIds, currentUser.id] }
          : g
      ),
    });
    logActivity("group", "Joined Group", `You joined ${group.name}`);
  };

  const leaveGroup = (groupId) => {
    const group = (db.groups || []).find(g => g.id === groupId);
    if (!group) return;

    updateDb({
      groups: (db.groups || [])
        .map((g) =>
          g.id === groupId
            ? { ...g, memberIds: g.memberIds.filter((id) => id !== currentUser.id) }
            : g
        )
        .filter((g) => g.memberIds.length > 0), // remove empty groups
    });
    logActivity("group", "Left Group", `You left ${group.name}`);
  };

  const changeGroupLeader = (groupId, newLeaderId) => {
    const group = (db.groups || []).find(g => g.id === groupId);
    const oldLeaderId = group?.leaderId;
    const newLeader = db.users.find(u => String(u.id) === String(newLeaderId));

    setDb((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((g) =>
        g.id === groupId ? { ...g, leaderId: newLeaderId } : g
      ),
    }));

    if (oldLeaderId) logActivity("group", "Leadership Transferred", `You transferred leadership to ${newLeader?.name || 'another member'}`, oldLeaderId);
    logActivity("group", "Promoted to Leader", `You are now the leader of ${group?.name || 'the group'}`, newLeaderId);
  };

  const removeGroupMember = (groupId, memberIdToRemove) => {
    const group = (db.groups || []).find(g => g.id === groupId);
    setDb((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            memberIds: g.memberIds.filter((id) => String(id) !== String(memberIdToRemove)),
          };
        }
        return g;
      }),
    }));
    logActivity("group", "Removed from Group", `You were removed from ${group?.name || 'the group'}`, memberIdToRemove);
  };

  const addGroupMember = (groupId, studentId) => {
    const group = (db.groups || []).find(g => g.id === groupId);
    setDb((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((g) => {
        if (g.id === groupId && !g.memberIds.includes(studentId) && !g.memberIds.includes(String(studentId))) {
          return { ...g, memberIds: [...g.memberIds, studentId] };
        }
        return g;
      }),
    }));
    logActivity("group", "Added to Group", `You were added to ${group?.name || 'a group'} by the leader`, studentId);
  };

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  // LAYOUT WRAPPER
  // ----------------------------------------------------------------
  const renderDashboardLayout = (requiredRole, children) => {
    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.role !== requiredRole) return <Navigate to={currentUser.role === 'admin' ? '/professor' : '/student'} />;
    
    return (
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-fadeIn">
        {/* ---- HEADER ---- */}
        <header className="glass-panel rounded-2xl flex justify-between items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 mb-6 animate-slideDown shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            {view === "course" && (
              <button onClick={navigateToDashboard} className="icon-btn mr-1 shrink-0" title="Back to Dashboard">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Layers className="text-primary w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg tracking-tight truncate">
                Eazy<span className="text-primary">Assign</span>
              </h1>
              {view === "course" && selectedCourse && (
                <p className="text-[10px] text-textMuted truncate max-w-40 sm:max-w-64">
                  {selectedCourse.code} · {selectedCourse.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 p-1 pr-3 rounded-full glass-panel-light overflow-hidden max-w-44">
              <div className="w-7 h-7 sm:w-8 sm:h-8 min-w-7 bg-primary text-white flex justify-center items-center rounded-full font-bold text-[10px] sm:text-xs shadow-glow shrink-0">
                {currentUser.avatar}
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">
                {currentUser.name}
              </span>
              <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0 ${currentUser.role === "admin" ? "bg-warning/20 text-warning border border-warning/20" : "bg-white/10 text-white/70 border border-white/5"}`}>
                {currentUser.role === "admin" ? "Prof" : "Student"}
              </span>
            </div>
            <button onClick={handleLogout} className="icon-btn" title="Logout">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* ---- DASHBOARD CONTENT ---- */}
        {children}
      </div>
    );
  };

  return (
    <div className="relative h-dvh w-full max-w-full overflow-x-hidden overflow-y-auto bg-transparent">
      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={
          !currentUser ? <Login onLogin={loginUser} onRegister={registerUser} /> : <Navigate to={currentUser.role === 'admin' ? '/professor' : '/student'} />
        } />
        
        <Route path="/student/*" element={
          renderDashboardLayout("student", 
            <StudentDashboard
              db={db}
              currentUser={currentUser}
              view={view}
              selectedCourse={selectedCourse}
              onNavigateToCourse={navigateToCourse}
              onNavigateToDashboard={navigateToDashboard}
              addSubmission={addSubmission}
              addGroupSubmission={addGroupSubmission}
              createGroup={createGroup}
              joinGroup={joinGroup}
              leaveGroup={leaveGroup}
              changeGroupLeader={changeGroupLeader}
              removeGroupMember={removeGroupMember}
              addGroupMember={addGroupMember}
              notifications={db.notifications.filter((n) => String(n.userId) === String(currentUser?.id))}
            />
          )
        } />
        
        <Route path="/professor/*" element={
          renderDashboardLayout("admin", 
            <ProfDashboard
              db={db}
              currentUser={currentUser}
              view={view}
              selectedCourse={selectedCourse}
              onNavigateToCourse={navigateToCourse}
              onNavigateToDashboard={navigateToDashboard}
              addAssignment={addAssignment}
              updateAssignment={updateAssignment}
              removeAssignment={removeAssignment}
              updateSubmission={updateSubmission}
              sendNotification={sendNotification}
            />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
