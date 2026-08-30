import React, { useMemo } from 'react';
import { ClockSettings, TimeState } from '../types/clock';
import { THEME_CONFIGS } from './ClockStyles';

interface AnalogClockNormalProps {
  time: TimeState;
  settings: ClockSettings;
  size?: number;
}

export const AnalogClockNormal: React.FC<AnalogClockNormalProps> = ({
  time,
  settings,
  size = 320,
}) => {
  const theme = THEME_CONFIGS[settings.theme].colors;

  // Exact angles calculations
  const { hourAngle, minuteAngle, secondAngle } = useMemo(() => {
    const isSmooth = settings.sweep === 'smooth';

    const ms = isSmooth ? time.milliseconds : 0;
    const sec = time.seconds + ms / 1000;
    const min = time.minutes + sec / 60;
    const hr = (time.hours % 12) + min / 60;

    return {
      hourAngle: hr * 30, // 360 / 12 = 30 deg per hour
      minuteAngle: min * 6, // 360 / 60 = 6 deg per minute
      secondAngle: isSmooth ? sec * 6 : time.seconds * 6,
    };
  }, [time.hours, time.minutes, time.seconds, time.milliseconds, settings.sweep]);

  // Generate 60 minute ticks
  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isFiveMin = i % 5 === 0;
      const rad = (angle - 90) * (Math.PI / 180);
      const outerR = 138;
      const innerR = isFiveMin ? 122 : 130;

      const x1 = 150 + outerR * Math.cos(rad);
      const y1 = 150 + outerR * Math.sin(rad);
      const x2 = 150 + innerR * Math.cos(rad);
      const y2 = 150 + innerR * Math.sin(rad);

      arr.push({
        key: i,
        x1,
        y1,
        x2,
        y2,
        isFiveMin,
        stroke: isFiveMin ? theme.majorTick : theme.minorTick,
        strokeWidth: isFiveMin ? 2.5 : 1,
      });
    }
    return arr;
  }, [theme.majorTick, theme.minorTick]);

  // Generate hour numerals (1 to 12)
  const hourNumerals = useMemo(() => {
    const numerals = [];
    for (let i = 1; i <= 12; i++) {
      const angle = i * 30;
      const rad = (angle - 90) * (Math.PI / 180);
      const r = 106;
      const x = 150 + r * Math.cos(rad);
      const y = 150 + r * Math.sin(rad);
      numerals.push({
        num: i,
        x,
        y,
      });
    }
    return numerals;
  }, []);

  // Outer minute labels (05, 10, 15... 60)
  const minuteNumerals = useMemo(() => {
    const numerals = [];
    for (let i = 5; i <= 60; i += 5) {
      const angle = (i === 60 ? 0 : i) * 6;
      const rad = (angle - 90) * (Math.PI / 180);
      const r = 141;
      const x = 150 + r * Math.cos(rad);
      const y = 150 + r * Math.sin(rad);
      numerals.push({
        label: String(i === 60 ? '60' : i).padStart(2, '0'),
        x,
        y,
      });
    }
    return numerals;
  }, []);

  return (
    <div className="relative flex flex-col items-center select-none">
      <svg
        viewBox="0 0 300 300"
        width={size}
        height={size}
        className="drop-shadow-2xl transition-all duration-300"
      >
        <defs>
          {/* Radial gradient for dial depth */}
          <radialGradient id="normalDialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.dialBg} stopOpacity="1" />
            <stop offset="85%" stopColor={theme.dialBg} stopOpacity="1" />
            <stop offset="100%" stopColor={theme.bezelInner} stopOpacity="1" />
          </radialGradient>

          {/* Bezel metallic rim */}
          <linearGradient id="bezelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bezelOuter} />
            <stop offset="50%" stopColor={theme.dialRing} />
            <stop offset="100%" stopColor={theme.bezelInner} />
          </linearGradient>

          <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Bezel */}
        <circle cx="150" cy="150" r="148" fill="url(#bezelGradient)" stroke={theme.dialRing} strokeWidth="1.5" />
        <circle cx="150" cy="150" r="144" fill={theme.bezelInner} />
        
        {/* Dial Face */}
        <circle cx="150" cy="150" r="139" fill="url(#normalDialGradient)" stroke={theme.dialRing} strokeWidth="0.75" />

        {/* Decorative subtle concentric rings */}
        <circle cx="150" cy="150" r="122" fill="none" stroke={theme.dialRing} strokeWidth="0.5" strokeDasharray="2,4" opacity="0.4" />
        <circle cx="150" cy="150" r="88" fill="none" stroke={theme.dialRing} strokeWidth="0.5" opacity="0.3" />

        {/* Quarter hour equivalence labels (25c, 50c, 75c) on the normal dial */}
        <text x="252" y="153" textAnchor="end" fill={theme.minuteHand} fontSize="6" fontWeight="800" opacity="0.85">= 25c</text>
        <text x="150" y="244" textAnchor="middle" fill={theme.minuteHand} fontSize="6" fontWeight="800" opacity="0.85">= 50c</text>
        <text x="48" y="153" textAnchor="start" fill={theme.minuteHand} fontSize="6" fontWeight="800" opacity="0.85">= 75c</text>

        {/* Brand / Label Text inside Dial */}
        <text
          x="150"
          y="78"
          textAnchor="middle"
          fill={theme.innerNumerals}
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="2.5"
          fontFamily="system-ui"
          opacity="0.85"
        >
          TEMPS SEXAGÉSIMAL
        </text>
        <text
          x="150"
          y="88"
          textAnchor="middle"
          fill={theme.labelSecondary}
          fontSize="6"
          fontWeight="600"
          letterSpacing="1.8"
          fontFamily="system-ui"
          opacity="0.7"
        >
          BASE 60 (1H = 60 MIN)
        </text>

        {/* Subtle bottom indicator */}
        <text
          x="150"
          y="218"
          textAnchor="middle"
          fill={theme.minuteHand}
          fontSize="6.5"
          fontWeight="600"
          letterSpacing="1.2"
          opacity="0.9"
        >
          MINUTE: {String(time.minutes).padStart(2, '0')}m
        </text>

        {/* Minute ticks */}
        {ticks.map((tick) => (
          <line
            key={tick.key}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.stroke}
            strokeWidth={tick.strokeWidth}
            strokeLinecap="round"
          />
        ))}

        {/* Hour Numerals 1..12 */}
        {hourNumerals.map((item) => (
          <text
            key={item.num}
            x={item.x}
            y={item.y + 5}
            textAnchor="middle"
            fill={theme.numerals}
            fontSize="14"
            fontWeight="700"
            fontFamily="'JetBrains Mono', sans-serif"
          >
            {item.num}
          </text>
        ))}

        {/* Minute small markers */}
        {minuteNumerals.map((item) => (
          <text
            key={item.label}
            x={item.x}
            y={item.y + 2}
            textAnchor="middle"
            fill={theme.minorTick}
            fontSize="5.5"
            fontWeight="600"
            fontFamily="'JetBrains Mono', monospace"
            opacity="0.75"
          >
            {item.label}
          </text>
        ))}

        {/* HOUR HAND */}
        <g transform={`rotate(${hourAngle} 150 150)`} filter="url(#handShadow)">
          <line
            x1="150"
            y1="165"
            x2="150"
            y2="92"
            stroke={theme.hourHand}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <polygon
            points="147.5,92 150,82 152.5,92"
            fill={theme.hourHand}
          />
          {/* Inner luminous insert */}
          <line
            x1="150"
            y1="145"
            x2="150"
            y2="98"
            stroke={theme.bezelInner}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* MINUTE HAND */}
        <g transform={`rotate(${minuteAngle} 150 150)`} filter="url(#handShadow)">
          <line
            x1="150"
            y1="172"
            x2="150"
            y2="52"
            stroke={theme.minuteHand}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <polygon
            points="148,53 150,42 152,53"
            fill={theme.minuteHand}
          />
          {/* Accent dot on minute hand */}
          <circle cx="150" cy="62" r="1.5" fill={theme.bezelInner} />
        </g>

        {/* SECOND HAND */}
        {settings.showSeconds && (
          <g transform={`rotate(${secondAngle} 150 150)`} filter="url(#handShadow)">
            {/* Counterweight */}
            <circle cx="150" cy="172" r="3.5" fill={theme.secondHand} />
            <line
              x1="150"
              y1="178"
              x2="150"
              y2="42"
              stroke={theme.secondHand}
              strokeWidth="1.4"
            />
            {/* Arrow/pointer needle */}
            <line
              x1="150"
              y1="42"
              x2="150"
              y2="34"
              stroke={theme.secondHand}
              strokeWidth="1.8"
            />
          </g>
        )}

        {/* Center Pivot Boss / Cap */}
        <circle cx="150" cy="150" r="6" fill={theme.hourHand} />
        <circle cx="150" cy="150" r="3.5" fill={theme.pivotBorder} />
        <circle cx="150" cy="150" r="1.5" fill={theme.pivotCenter} />
      </svg>
    </div>
  );
};
