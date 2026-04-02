import React from "react";

/**
 * ProgressRing — circular progress indicator
 * @param {number} percent - 0 to 100
 * @param {number} size - diameter in px (default 48)
 * @param {number} stroke - stroke width (default 4)
 * @param {string} color - tailwind color class or hex
 */
export default function ProgressRing({
  percent = 0,
  size = 48,
  stroke = 4,
  colorClass = "text-primary",
  label,
  sublabel,
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-700`}
            stroke="currentColor"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white"
          style={{ fontSize: size < 40 ? 8 : 10 }}
        >
          {percent}%
        </span>
      </div>
      {(label || sublabel) && (
        <div>
          {label && (
            <div className="text-xs sm:text-sm font-bold text-white leading-tight">
              {label}
            </div>
          )}
          {sublabel && (
            <div className="text-[10px] sm:text-xs text-textMuted">{sublabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
