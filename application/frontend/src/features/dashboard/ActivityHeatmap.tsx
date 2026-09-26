/**
 * ActivityHeatmap.tsx
 * 90-Day institutional procurement query surveillance calendar heatmap.
 */

import React, { useState } from 'react';

interface ActivityHeatmapProps {
  queriesByDate: Record<string, number>;
}

interface DayCell {
  date: string;
  count: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon...
  monthName: string;
  formattedDate: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ queriesByDate }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    formattedDate: string;
    x: number;
    y: number;
  } | null>(null);

  // Generate 91 days (13 full weeks of 7 days)
  const days: DayCell[] = [];
  const today = new Date();
  const maxCount = Math.max(1, ...Object.values(queriesByDate));

  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = queriesByDate[dateStr] || 0;
    const dayOfWeek = d.getDay();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const formattedDate = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    days.push({
      date: dateStr,
      count,
      dayOfWeek,
      monthName,
      formattedDate,
    });
  }

  // Group days into columns of 7 (weeks)
  // Align start to the first day's dayOfWeek
  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  // Pad the first week if necessary
  const firstDayOfWeek = days[0].dayOfWeek;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: `pad-${i}`,
      count: -1,
      dayOfWeek: i,
      monthName: '',
      formattedDate: '',
    });
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: `pad-end-${currentWeek.length}`,
        count: -1,
        dayOfWeek: currentWeek.length,
        monthName: '',
        formattedDate: '',
      });
    }
    weeks.push(currentWeek);
  }

  // Get color for count
  const getCellColor = (count: number) => {
    if (count < 0) return 'transparent';
    if (count === 0) return 'var(--surface)';
    const intensity = Math.min(1, count / maxCount);
    // Interpolate alpha from 0.20 to 1.0
    const alpha = 0.18 + intensity * 0.82;
    return `rgba(27, 79, 224, ${alpha.toFixed(2)})`;
  };

  // Extract month markers for top header
  const monthLabels: { index: number; name: string }[] = [];
  let lastMonth = '';
  weeks.forEach((week, wIdx) => {
    const validDay = week.find((d) => d.count >= 0);
    if (validDay && validDay.monthName !== lastMonth) {
      monthLabels.push({ index: wIdx, name: validDay.monthName });
      lastMonth = validDay.monthName;
    }
  });

  return (
    <div className="workbench-card" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <div>
          <div className="section-label" style={{ margin: 0 }}>
            90-DAY PROCUREMENT ACTIVITY HEATMAP
          </div>
          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Temporal density of statutory standard verification and compliance checks
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--ink-muted)' }}>Less</span>
          <div style={{ width: '11px', height: '11px', backgroundColor: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', backgroundColor: 'rgba(27, 79, 224, 0.25)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', backgroundColor: 'rgba(27, 79, 224, 0.55)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', backgroundColor: 'rgba(27, 79, 224, 0.85)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', backgroundColor: 'var(--collapse-cobalt)', borderRadius: '2px' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--ink-muted)' }}>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '6px' }}>
        {/* Month labels */}
        <div style={{ display: 'flex', marginLeft: '28px', marginBottom: '4px', position: 'relative', height: '14px' }}>
          {monthLabels.map((m) => (
            <div
              key={`${m.name}-${m.index}`}
              style={{
                position: 'absolute',
                left: `${m.index * 16}px`,
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: 'var(--ink-muted)',
                fontWeight: 600,
              }}
            >
              {m.name}
            </div>
          ))}
        </div>

        {/* Grid: Day labels + Week Columns */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
          {/* Day of week labels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: 'var(--font-data)',
              fontSize: '9px',
              color: 'var(--ink-muted)',
              width: '24px',
              paddingTop: '2px',
            }}
          >
            <span style={{ height: '12px' }}>Sun</span>
            <span style={{ height: '12px' }}>Mon</span>
            <span style={{ height: '12px' }}>Tue</span>
            <span style={{ height: '12px' }}>Wed</span>
            <span style={{ height: '12px' }}>Thu</span>
            <span style={{ height: '12px' }}>Fri</span>
            <span style={{ height: '12px' }}>Sat</span>
          </div>

          {/* Heatmap Matrix Columns */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {weeks.map((week, wIdx) => (
              <div key={`week-${wIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((cell) => {
                  if (cell.count < 0) {
                    return (
                      <div
                        key={cell.date}
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'transparent',
                        }}
                      />
                    );
                  }

                  const isHigh = cell.count > maxCount * 0.7;

                  return (
                    <div
                      key={cell.date}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          date: cell.date,
                          count: cell.count,
                          formattedDate: cell.formattedDate,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getCellColor(cell.count),
                        borderRadius: '2px',
                        cursor: 'pointer',
                        border: isHigh ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(0,0,0,0.05)',
                        transition: 'transform 0.1s ease',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 48}px`,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--void)',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            border: '1px solid var(--hairline)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 600 }}>
            {hoveredCell.count} {hoveredCell.count === 1 ? 'Query' : 'Queries'}
          </div>
          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '10px', color: '#A0A8B8' }}>
            {hoveredCell.formattedDate}
          </div>
        </div>
      )}
    </div>
  );
};
