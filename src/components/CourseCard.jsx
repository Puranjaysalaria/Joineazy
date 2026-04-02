import React from "react";
import { BookOpen, Users, Clock, ChevronRight, CheckCircle } from "lucide-react";
import ProgressRing from "./ProgressRing";

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/20 hover:border-primary/50",
    text: "text-primary",
    glow: "hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)]",
    badge: "bg-primary/20 text-primary border-primary/30",
    ring: "text-primary",
    orb: "rgba(139,92,246,0.15)",
  },
  success: {
    bg: "bg-success/10",
    border: "border-success/20 hover:border-success/50",
    text: "text-success",
    glow: "hover:shadow-[0_8px_32px_rgba(16,185,129,0.2)]",
    badge: "bg-success/20 text-success border-success/30",
    ring: "text-success",
    orb: "rgba(16,185,129,0.15)",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20 hover:border-warning/50",
    text: "text-warning",
    glow: "hover:shadow-[0_8px_32px_rgba(245,158,11,0.2)]",
    badge: "bg-warning/20 text-warning border-warning/30",
    ring: "text-warning",
    orb: "rgba(245,158,11,0.15)",
  },
};

export default function CourseCard({
  course,
  role,
  totalAssignments = 0,
  completedAssignments = 0,
  totalStudents = 0,
  onClick,
}) {
  const c = colorMap[course.color] || colorMap.primary;
  const percent =
    totalAssignments === 0
      ? 0
      : Math.round((completedAssignments / totalAssignments) * 100);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-panel rounded-2xl p-5 sm:p-6 border transition-all duration-300 
        hover:-translate-y-1 cursor-pointer group relative overflow-hidden
        ${c.border} ${c.glow} animate-fadeIn`}
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${c.orb} 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl ${c.bg} shrink-0`}>
          <BookOpen className={`w-5 h-5 ${c.text}`} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${c.badge}`}>
          {course.code}
        </span>
      </div>

      {/* Course Info */}
      <div className="relative z-10 mb-4">
        <h3 className="font-bold text-white text-base sm:text-lg leading-tight mb-1 group-hover:text-white transition-colors">
          {course.name}
        </h3>
        <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between gap-3 relative z-10 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-textMuted">
            <Clock className="w-3.5 h-3.5" />
            {totalAssignments} {totalAssignments === 1 ? "task" : "tasks"}
          </span>
          {role === "admin" ? (
            <span className="flex items-center gap-1 text-xs text-textMuted">
              <Users className="w-3.5 h-3.5" />
              {totalStudents} students
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-textMuted">
              <CheckCircle className="w-3.5 h-3.5" />
              {completedAssignments}/{totalAssignments} done
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {role === "student" && (
            <ProgressRing percent={percent} size={36} stroke={3} colorClass={c.ring} />
          )}
          <ChevronRight className={`w-4 h-4 ${c.text} opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1`} />
        </div>
      </div>

      {/* Semester tag */}
      <div className="mt-3 relative z-10">
        <span className="text-[10px] text-textMuted/60">{course.semester}</span>
      </div>
    </button>
  );
}
