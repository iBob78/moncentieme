import React, { useMemo } from 'react';
import { ClockSettings, TimeState } from '../types/clock';
import { THEME_CONFIGS } from './ClockStyles';
import { timeToCentesimal } from '../utils/timeCalculations';

interface AnalogClockCentesimalProps {
  time: TimeState;
  settings: ClockSettings;
  size?: number;
}

export const AnalogClockCentesimal: React.FC<AnalogClockCentesimalProps> = ({
  time,
  settings,
  size = 320,
}) => {
  const theme = THEME_CONFIGS[settings.theme].colors;

  // Convert time to exact centesimal value
  const isSmooth = settings.sweep === 'smooth';
  const ms = isSmooth ? time.milliseconds : 0;
  const centesimalTotal = timeToCentesimal(time.hours, time.minutes, time.seconds, ms);
  
  // Fraction of the current hour in centièmes: 0.00 to 99.99...
  const centesimalMinutes = (centesimalTotal - Math.floor(centesimalTotal)) * 100;

  // Exact angles calculations
  const { hourAngle, centiemeAngle, subSecondAngle } = useMemo(() => {
    // Hour hand: 360 / 12 = 30 deg per hour
    const hr = (time.hours % 12) + (time.minutes / 60) + (time.seconds / 3600);
    const hourHandAngle = hr * 30;

    // Centième hand rotates 360 deg per hour (100 centièmes = 360 deg, so 3.6 deg per centième)
    const cHandAngle = centesimalMinutes * 3.6;

    // Sub-second hand rotates 360 deg every 60 real seconds — perfectly synced
    // with the sexagesimal seconds hand.
    // In the centesimal system, 1 minute = 100 centiseconds.
    // Each centisecond = 0.6 real seconds.
    const totalSec = time.seconds + (isSmooth ? time.milliseconds / 1000 : 0);
    const subSecAngle = (totalSec / 60) * 360;

    return {
      hourAngle: hourHandAngle,
      centiemeAngle: cHandAngle,
      subSecondAngle: subSecAngle,
    };
  }, [time.hours, time.minutes, time.seconds, time.milliseconds, centesimalMinutes, isSmooth]);

  // Generate 100 ticks for centesimal dial (every 3.6 degrees!)
  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
      const angle = i * 3.6; // 360 / 100
      const isTen = i % 10 === 0;
      const isFive = i % 5 === 0;
      const isQuarter = i === 25 || i === 50 || i === 75 || i === 0;

      const rad = (angle - 90) * (Math.PI / 180);
      const outerR = 138;
      let innerR = 131;
      let strokeW = 1;
      let strokeColor = theme.minorTick;

      if (isQuarter) {
        innerR = 121;
        strokeW = 2.8;
        strokeColor = theme.centesimalHand;
      } else if (isTen) {
        innerR = 123;
        strokeW = 2.2;
        strokeColor = theme.majorTick;
      } else if (isFive) {
        innerR = 127;
        strokeW = 1.4;
        strokeColor = theme.majorTick;
      }

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
        stroke: strokeColor,
        strokeWidth: strokeW,
      });
    }
    return arr;
  }, [theme.majorTick, theme.minorTick, theme.centesimalHand]);

  // Centesimal numerals: 00, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90
  const centesimalNumerals = useMemo(() => {
    const markers = [
      { val: 0, label: '00', highlight: true },
      { val: 10, label: '10', highlight: false },
      { val: 20, label: '20', highlight: false },
      { val: 25, label: '25', highlight: true }, // 15 min equivalent
      { val: 30, label: '30', highlight: false },
      { val: 40, label: '40', highlight: false },
      { val: 50, label: '50', highlight: true }, // 30 min equivalent
      { val: 60, label: '60', highlight: false },
      { val: 70, label: '70', highlight: false },
      { val: 75, label: '75', highlight: true }, // 45 min equivalent
      { val: 80, label: '80', highlight: false },
      { val: 90, label: '90', highlight: false },
    ];

    return markers.map((m) => {
      const angle = m.val * 3.6;
      const rad = (angle - 90) * (Math.PI / 180);
      const r = 108;
      const x = 150 + r * Math.cos(rad);
      const y = 150 + r * Math.sin(rad);
      return {
        ...m,
        x,
        y,
      };
    });
  }, []);

  // Inner hour markings (1 to 12) for the hour hand reference
  const innerHourNumerals = useMemo(() => {
    const numerals = [];
    for (let i = 1; i <= 12; i++) {
      const angle = i * 30;
      const rad = (angle - 90) * (Math.PI / 180);
      const r = 78;
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

  return (
    <div className="relative flex flex-col items-center select-none">
      <svg
        viewBox="0 0 300 300"
        width={size}
        height={size}
        className="drop-shadow-2xl transition-all duration-300"
      >
        <defs>
          <radialGradient id="centesimalDialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.dialBg} stopOpacity="1" />
            <stop offset="85%" stopColor={theme.dialBg} stopOpacity="1" />
            <stop offset="100%" stopColor={theme.bezelInner} stopOpacity="1" />
          </radialGradient>

          <linearGradient id="bezelGradientCent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bezelOuter} />
            <stop offset="50%" stopColor={theme.dialRing} />
            <stop offset="100%" stopColor={theme.bezelInner} />
          </linearGradient>

          <filter id="cHandShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Bezel */}
        <circle cx="150" cy="150" r="148" fill="url(#bezelGradientCent)" stroke={theme.dialRing} strokeWidth="1.5" />
        <circle cx="150" cy="150" r="144" fill={theme.bezelInner} />

        {/* Dial Face */}
        <circle cx="150" cy="150" r="139" fill="url(#centesimalDialGradient)" stroke={theme.dialRing} strokeWidth="0.75" />

        {/* Concentric reference track for 100 graduations */}
        <circle cx="150" cy="150" r="121" fill="none" stroke={theme.dialRing} strokeWidth="0.6" strokeDasharray="3,3" opacity="0.5" />
        <circle cx="150" cy="150" r="92" fill="none" stroke={theme.dialRing} strokeWidth="0.5" opacity="0.35" />
        <circle cx="150" cy="150" r="66" fill="none" stroke={theme.dialRing} strokeWidth="0.5" strokeDasharray="1,3" opacity="0.25" />

        {/* Quarter hour equivalence labels (15m, 30m, 45m) on the dial */}
        <text x="252" y="153" textAnchor="end" fill={theme.centesimalHand} fontSize="6" fontWeight="800" opacity="0.85">15m (¼h)</text>
        <text x="150" y="244" textAnchor="middle" fill={theme.centesimalHand} fontSize="6" fontWeight="800" opacity="0.85">30m (½h)</text>
        <text x="48" y="153" textAnchor="start" fill={theme.centesimalHand} fontSize="6" fontWeight="800" opacity="0.85">45m (¾h)</text>

        {/* Dial Labels */}
        <text
          x="150"
          y="78"
          textAnchor="middle"
          fill={theme.centesimalHand}
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="2.2"
          fontFamily="system-ui"
          opacity="0.9"
        >
          TEMPS CENTÉSIMAL
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
          BASE 100 (1H = 100c)
        </text>

        {/* Live Centièmes readout on dial */}
        <text
          x="150"
          y="218"
          textAnchor="middle"
          fill={theme.centesimalHand}
          fontSize="6.5"
          fontWeight="700"
          letterSpacing="1.2"
          opacity="0.95"
        >
          CENTIÈME: {centesimalMinutes.toFixed(2)}c
        </text>

        {/* Sub-second label: centiseconds within current minute (0-100), perfectly synced with sexagesimal seconds hand */}
        <text
          x="150"
          y="230"
          textAnchor="middle"
          fill={theme.secondHand}
          fontSize="5.5"
          fontWeight="600"
          letterSpacing="1"
          opacity="0.75"
        >
          100c/min : {Math.round(((time.seconds + (isSmooth ? time.milliseconds / 1000 : 0)) / 60) * 100)}
        </text>

        {/* 100 Centesimal Ticks */}
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

        {/* Centesimal Numerals (00, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90) */}
        {centesimalNumerals.map((m) => (
          <text
            key={m.label}
            x={m.x}
            y={m.y + 4.5}
            textAnchor="middle"
            fill={m.highlight ? theme.centesimalHand : theme.numerals}
            fontSize={m.highlight ? '13' : '11'}
            fontWeight={m.highlight ? '800' : '600'}
            fontFamily="'JetBrains Mono', sans-serif"
          >
            {m.label}
          </text>
        ))}

        {/* Inner Hour Markers 1..12 */}
        {innerHourNumerals.map((item) => (
          <text
            key={item.num}
            x={item.x}
            y={item.y + 3}
            textAnchor="middle"
            fill={theme.innerNumerals}
            fontSize="8"
            fontWeight="500"
            fontFamily="'JetBrains Mono', monospace"
            opacity="0.65"
          >
            {item.num}h
          </text>
        ))}

        {/* HOUR HAND */}
        <g transform={`rotate(${hourAngle} 150 150)`} filter="url(#cHandShadow)">
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

        {/* CENTIÈME HAND (Aiguille des centièmes 0..100) */}
        <g transform={`rotate(${centiemeAngle} 150 150)`} filter="url(#cHandShadow)">
          <line
            x1="150"
            y1="172"
            x2="150"
            y2="50"
            stroke={theme.centesimalHand}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <polygon
            points="147.5,52 150,38 152.5,52"
            fill={theme.centesimalHand}
          />
          {/* Centesimal hand ring ornament */}
          <circle cx="150" cy="58" r="2" fill={theme.bezelInner} stroke={theme.centesimalHand} strokeWidth="1" />
        </g>

        {/* CENTISECOND HAND — perfectly synced with sexagesimal seconds hand.
            Completes 1 full rotation every 60 real seconds (0-100 centiseconds per minute). */}
        {settings.showSeconds && (
          <g transform={`rotate(${subSecondAngle} 150 150)`} filter="url(#cHandShadow)">
            <circle cx="150" cy="172" r="3.5" fill={theme.secondHand} />
            <line
              x1="150"
              y1="178"
              x2="150"
              y2="44"
              stroke={theme.secondHand}
              strokeWidth="1.4"
            />
            <line
              x1="150"
              y1="44"
              x2="150"
              y2="36"
              stroke={theme.secondHand}
              strokeWidth="1.8"
            />
          </g>
        )}

        {/* Center Pivot Boss / Cap */}
        <circle cx="150" cy="150" r="6" fill={theme.hourHand} />
        <circle cx="150" cy="150" r="3.5" fill={theme.centesimalHand} />
        <circle cx="150" cy="150" r="1.5" fill={theme.pivotCenter} />
      </svg>
    </div>
  );
};
