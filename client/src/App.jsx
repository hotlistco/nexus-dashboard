import { useMemo, useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';

const OW_TO_BASMILIUS = {
  '01d': 'clear-day',
  '01n': 'clear-night',
  '02d': 'partly-cloudy-day',
  '02n': 'partly-cloudy-night',
  '03d': 'cloudy',
  '03n': 'cloudy',
  '04d': 'overcast-day',
  '04n': 'overcast-night',
  '09d': 'drizzle',
  '09n': 'drizzle',
  '10d': 'partly-cloudy-day-rain',
  '10n': 'partly-cloudy-night-rain',
  '11d': 'thunderstorms-day',
  '11n': 'thunderstorms-night',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'fog-day',
  '50n': 'fog-night',
};

function weatherIcon(code) {
  const name = OW_TO_BASMILIUS[code] || 'cloudy';
  return `/images/weather-icons/${name}.svg`;
}

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 16, letterSpacing: 4, color: '#b9c6d8', textTransform: 'uppercase' }}>{children}</div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 20,
      boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
      backdropFilter: 'blur(16px)',
      ...style
    }}>{children}</div>
  );
}

const TRADITIONAL_MOON_NAMES = ['Wolf Moon', 'Snow Moon', 'Worm Moon', 'Pink Moon', 'Flower Moon', 'Strawberry Moon', 'Buck Moon', 'Sturgeon Moon', 'Harvest Moon', 'Hunter\'s Moon', 'Beaver Moon', 'Cold Moon'];

// Total lunar eclipse dates (blood moons) through 2030
const BLOOD_MOON_DATES = new Set(['2025-03-14', '2025-09-07', '2026-03-03', '2026-08-28', '2028-07-06', '2029-01-01', '2029-06-26', '2030-06-16']);

function getMoonPhase() {
  const now = new Date();
  const nowMs = now.getTime();

  // Synodic phase (0=new, 0.5=full, 1=new)
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const synodicMs = 29.53058867 * 24 * 60 * 60 * 1000;
  const phase = ((nowMs - knownNewMoon) % synodicMs + synodicMs) % synodicMs / synodicMs;

  // Anomalistic phase for super/micro moon (0=perigee, ~0.5=apogee)
  const knownPerigee = new Date('2019-01-21T05:00:00Z').getTime();
  const anomalisticMs = 27.554551 * 24 * 60 * 60 * 1000;
  const perigeePhase = ((nowMs - knownPerigee) % anomalisticMs + anomalisticMs) % anomalisticMs / anomalisticMs;

  const nearFull = phase > 0.45 && phase < 0.55;
  const nearPerigee = perigeePhase < 0.1 || perigeePhase > 0.9;
  const nearApogee = perigeePhase > 0.4 && perigeePhase < 0.6;
  const isSuperMoon = nearFull && nearPerigee;
  const isMicroMoon = nearFull && nearApogee;

  // Blood moon: today matches a known total lunar eclipse date (local date)
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isBloodMoon = BLOOD_MOON_DATES.has(localDate);

  // Blue moon: second full moon in the same calendar month
  let isBlueMonth = false;
  if (nearFull) {
    const msSinceFull = (phase >= 0.5 ? phase - 0.5 : phase + 0.5) * synodicMs;
    const prevFullMs = nowMs - msSinceFull;
    const prevPrevFullMs = prevFullMs - synodicMs;
    const prev = new Date(prevPrevFullMs);
    isBlueMonth = prev.getMonth() === now.getMonth() && prev.getFullYear() === now.getFullYear();
  }

  // Harvest Moon: full moon nearest the autumnal equinox (~Sep 22)
  // Hunter's Moon: full moon nearest Oct 22 (one month after equinox)
  let isHarvestMoon = false, isHuntersMoon = false;
  if (nearFull) {
    const equinox = new Date(now.getFullYear(), 8, 22, 12, 0, 0).getTime();
    const daysFromEquinox = (nowMs - equinox) / (24 * 60 * 60 * 1000);
    isHarvestMoon = Math.abs(daysFromEquinox) < 14.77;
    const huntersTarget = new Date(now.getFullYear(), 9, 22, 12, 0, 0).getTime();
    const daysFromHunters = (nowMs - huntersTarget) / (24 * 60 * 60 * 1000);
    isHuntersMoon = !isHarvestMoon && Math.abs(daysFromHunters) < 14.77;
  }

  // Base phase name
  let phaseName = (() => {
    if (phase < 0.03 || phase > 0.97) return 'New Moon';
    if (phase < 0.22) return 'Waxing Crescent';
    if (phase < 0.28) return 'First Quarter';
    if (phase < 0.47) return 'Waxing Gibbous';
    if (phase < 0.53) return 'Full Moon';
    if (phase < 0.72) return 'Waning Gibbous';
    if (phase < 0.78) return 'Last Quarter';
    return 'Waning Crescent';
  })();

  // Special name overrides (priority order)
  if (nearFull) {
    if (isHarvestMoon) phaseName = 'Harvest Moon';
    else if (isHuntersMoon) phaseName = "Hunter's Moon";
    if (isMicroMoon) phaseName = 'Micro Moon';
    if (isSuperMoon) phaseName = isBloodMoon ? 'Super Blood Moon' : 'Super Moon';
    if (isBloodMoon && !isSuperMoon) phaseName = 'Blood Moon';
    if (isBlueMonth) phaseName = isSuperMoon ? 'Super Blue Moon' : 'Blue Moon';
  }

  // Traditional monthly name (shown as subtitle when it's a full moon)
  const traditionalName = nearFull ? TRADITIONAL_MOON_NAMES[now.getMonth()] : null;

  // Overlay color tint
  let overlay = null;
  if (isBloodMoon) overlay = 'rgba(180,40,10,0.38)';
  else if (isBlueMonth) overlay = 'rgba(40,80,220,0.28)';
  else if (isHarvestMoon || isHuntersMoon) overlay = 'rgba(210,120,10,0.28)';

  return { phase, phaseName, traditionalName, overlay };
}

function MoonPhase({ size = 60 }) {
  const { phase, phaseName, traditionalName, overlay } = getMoonPhase();
  const r = size / 2;

  const waxing = phase < 0.5;
  const halfPhase = waxing ? phase * 2 : (phase - 0.5) * 2;
  const terminatorRx = r * Math.cos(halfPhase * Math.PI);
  const absRx = Math.abs(terminatorRx);

  let shadowPath = null;
  if (halfPhase <= 0.01) {
    shadowPath = `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${size} A ${r} ${r} 0 1 1 ${r} 0 Z`;
  } else if (halfPhase < 0.99) {
    const terminatorSweep = waxing ? (terminatorRx > 0 ? 0 : 1) : (terminatorRx > 0 ? 1 : 0);
    const outerSweep = waxing ? 0 : 1;
    shadowPath = `M ${r} 0 A ${r} ${r} 0 1 ${outerSweep} ${r} ${size} A ${absRx} ${r} 0 1 ${terminatorSweep} ${r} 0 Z`;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <clipPath id="moonCircleClip">
            <circle cx={r} cy={r} r={r} />
          </clipPath>
        </defs>
        <image href="/images/fullMoon.png" x={0} y={0} width={size} height={size} clipPath="url(#moonCircleClip)" />
        {overlay && <circle cx={r} cy={r} r={r} fill={overlay} clipPath="url(#moonCircleClip)" />}
        {shadowPath && <path d={shadowPath} fill="rgba(0,0,0,0.80)" clipPath="url(#moonCircleClip)" />}
      </svg>
      <div>
        <div style={{ fontSize: 15, color: '#d8e2ef' }}>{phaseName}</div>
        {traditionalName && traditionalName !== phaseName && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{traditionalName}</div>
        )}
      </div>
    </div>
  );
}

function WeatherPanel({ weather }) {
  const current = weather?.current;
  return (
    <Card style={{ padding: '12px 20px', height: '100%', boxSizing: 'border-box', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(255,255,255,0.04))', display: 'flex', alignItems: 'center' }}>
      {current ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <img src={weatherIcon(current.iconCode)} alt={current.description} style={{ width: 64, height: 64 }} />
            <div>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>{current.temp}</div>
              <div style={{ fontSize: 15, color: '#d8e2ef', marginTop: 2, textTransform: 'capitalize' }}>{current.description}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <MoonPhase />
          </div>
          <div style={{ textAlign: 'right', fontSize: 15, color: '#b9c6d8', lineHeight: 1.7 }}>
            <div style={{ fontSize: 17, color: '#d8e2ef' }}>{current.location}</div>
            <div>Feels like {current.feelsLike}</div>
            {current.wind ? <div>Wind {current.wind}</div> : null}
            <div>Humidity {current.humidity}</div>
          </div>
        </div>
      ) : <div style={{ fontSize: 20, color: '#d8e2ef' }}>Loading weather…</div>}
    </Card>
  );
}

function WeatherMode({ weather }) {
  const current = weather?.current;
  const forecast = weather?.forecast || [];
  return (
    <Card style={{ height: '100%', padding: 28, boxSizing: 'border-box', background: 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(255,255,255,0.04))', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle>5-Day Forecast</SectionTitle>
      {current ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <img src={weatherIcon(current.iconCode)} alt={current.description} style={{ width: 80, height: 80 }} />
              <div>
                <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1 }}>{current.temp}</div>
                <div style={{ fontSize: 22, color: '#d8e2ef', marginTop: 4, textTransform: 'capitalize' }}>{current.description} · {current.location}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 18, color: '#b9c6d8', lineHeight: 2 }}>
              <div>Feels like {current.feelsLike}</div>
              {current.wind ? <div>Wind {current.wind}</div> : null}
              <div>Humidity {current.humidity}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <img src="/images/weather-icons/sunrise.svg" style={{ width: 24, height: 24 }} alt="Sunrise" />
                {current.sunrise}
                <img src="/images/weather-icons/sunset.svg" style={{ width: 24, height: 24, marginLeft: 8 }} alt="Sunset" />
                {current.sunset}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, minHeight: 0 }}>
            {forecast.map((day) => (
              <div key={day.day} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, padding: '12px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#d8e2ef' }}>{day.day}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, width: '100%' }}>
                  <img src={weatherIcon(day.iconCode)} alt={day.description} style={{ width: '100%', height: '100%', minWidth: 80, minHeight: 0, objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 22, color: '#94a3b8', textTransform: 'capitalize', lineHeight: 1.2 }}>{day.description}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{day.high} <span style={{ fontSize: 26, color: '#94a3b8', fontWeight: 400 }}>{day.low}</span></div>
                  <div style={{ fontSize: 16, color: '#7dd3fc' }}>💧 {day.pop}{day.precip ? ` · ${day.precip}` : ''}</div>
                  {day.wind ? <div style={{ fontSize: 15, color: '#b9c6d8' }}>🌬️ {day.wind}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : <div style={{ fontSize: 24, color: '#d8e2ef' }}>Loading weather…</div>}
    </Card>
  );
}

function NytHomeMode({ items }) {
  if (!items?.length) return (
    <Card style={{ height: '100%', padding: 32, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 28, color: '#d8e2ef' }}>Loading NYT headlines…</div>
    </Card>
  );
  const [lead, ...rest] = items;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle>New York Times - Front Page</SectionTitle>
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
        {/* Lead story — square */}
        <Card style={{ aspectRatio: '1 / 1', height: '100%', flexShrink: 0, padding: 0, overflow: 'hidden', position: 'relative', backgroundImage: lead.image ? `linear-gradient(to bottom, rgba(2,6,23,0.1) 0%, rgba(2,6,23,0.82) 100%), url(${lead.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px' }}>
            <div style={{ fontSize: 38, lineHeight: 1.2, fontWeight: 700 }}>{lead.title}</div>
            {lead.description && <div style={{ fontSize: 22, color: '#d8e2ef', marginTop: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.description}</div>}
            {lead.date && <div style={{ fontSize: 13, color: '#7dd3fc', marginTop: 8 }}>{lead.date}</div>}
          </div>
        </Card>
        {/* Next 3 stories stacked on the right */}
        <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: 12, minHeight: 0 }}>
          {rest.slice(0, 3).map((item) => (
            <Card key={item.title} style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'flex-end', backgroundImage: item.image ? `linear-gradient(to bottom, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.88) 60%), url(${item.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 26, lineHeight: 1.3, fontWeight: 600 }}>{item.title}</div>
                {item.description && <div style={{ fontSize: 19, color: '#d8e2ef', marginTop: 5, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>}
                {item.date && <div style={{ fontSize: 13, color: '#7dd3fc', marginTop: 5 }}>{item.date}</div>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function NytTechMode({ items }) {
  if (!items?.length) return (
    <Card style={{ height: '100%', padding: 32, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 28, color: '#d8e2ef' }}>Loading NYT Technology…</div>
    </Card>
  );
  const [lead, ...rest] = items;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle>New York Times - Technology</SectionTitle>
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
        <Card style={{ aspectRatio: '1 / 1', height: '100%', flexShrink: 0, padding: 0, overflow: 'hidden', position: 'relative', backgroundImage: lead.image ? `linear-gradient(to bottom, rgba(2,6,23,0.1) 0%, rgba(2,6,23,0.82) 100%), url(${lead.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px' }}>
            <div style={{ fontSize: 38, lineHeight: 1.2, fontWeight: 700 }}>{lead.title}</div>
            {lead.description && <div style={{ fontSize: 22, color: '#d8e2ef', marginTop: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.description}</div>}
            {lead.date && <div style={{ fontSize: 13, color: '#7dd3fc', marginTop: 8 }}>{lead.date}</div>}
          </div>
        </Card>
        <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: 12, minHeight: 0 }}>
          {rest.slice(0, 3).map((item) => (
            <Card key={item.title} style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'flex-end', backgroundImage: item.image ? `linear-gradient(to bottom, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.88) 60%), url(${item.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 26, lineHeight: 1.3, fontWeight: 600 }}>{item.title}</div>
                {item.description && <div style={{ fontSize: 19, color: '#d8e2ef', marginTop: 5, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>}
                {item.date && <div style={{ fontSize: 13, color: '#7dd3fc', marginTop: 5 }}>{item.date}</div>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatVolume(v) {
  const n = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v;
  if (isNaN(n) || n === 0) return typeof v === 'string' && v ? v : 'Trending';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M searches`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K searches`;
  return `${n.toLocaleString()} searches`;
}

function timeAgo(timestamp) {
  if (!timestamp) return null;
  const diffMs = Date.now() - timestamp * 1000;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function TrendsMode({ items }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle>Trending searches</SectionTitle>
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: `repeat(${items.length}, 1fr)`, gap: 10, minHeight: 0 }}>
        {items.map((item, index) => (
          <Card key={item.query} style={{ padding: '8px 20px', display: 'grid', gridTemplateColumns: '70px 1fr', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 28, color: '#b9c6d8' }}>#{index + 1}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
              <div style={{ fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{item.query}</div>
              {item.breakdown?.length > 0 && (
                <div style={{ fontSize: 17, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.breakdown.slice(0, 4).join(' · ')}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginLeft: 'auto', flexShrink: 0 }}>
                {item.volume != null && (
                  <div style={{ fontSize: 20, color: '#7dd3fc' }}>{formatVolume(item.volume)}</div>
                )}
                {item.startTimestamp != null && (
                  <div style={{ fontSize: 17, color: '#86efac' }}>{timeAgo(item.startTimestamp)}</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StocksMode({ items }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle>Detailed stocks</SectionTitle>
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: `repeat(${items.length}, 1fr)`, gap: 10, minHeight: 0 }}>
        {items.map((stock) => (
          <Card key={stock.symbol} style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '140px 160px 140px 1fr', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stock.symbol}</div>
            <div style={{ fontSize: 24 }}>{stock.price}</div>
            <div style={{ fontSize: 22, color: stock.positive ? '#86efac' : '#fca5a5' }}>{stock.change}</div>
            <div style={{ position: 'relative', height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.07)' }}>
              {stock.high > stock.low && (
                <div style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                  left: `${((stock.current - stock.low) / (stock.high - stock.low)) * 100}%`,
                  width: 10, height: 24, borderRadius: 4,
                  background: stock.positive ? '#86efac' : '#f87171',
                  marginLeft: -5
                }} />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LearningMode({ learning }) {
  return (
    <Card style={{ padding: 32, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <SectionTitle>{learning.type}</SectionTitle>
      <div style={{ fontSize: 52, lineHeight: 1.12, fontWeight: 650, maxWidth: '88%' }}>{learning.title}</div>
      <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.4, color: '#d8e2ef', maxWidth: '86%' }}>{learning.body}</div>
    </Card>
  );
}

function TaskRow({ task, accentColor = '#ffffff', dimmed = false }) {
  return (
    <div style={{
      padding: '14px 18px',
      display: 'grid',
      gridTemplateColumns: '40px 1fr',
      gap: 14,
      alignItems: 'center',
      borderRadius: 16,
      border: `1px solid ${accentColor}22`,
      background: dimmed ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
    }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, border: task.completed ? '2px solid #86efac' : '2px solid rgba(255,255,255,0.4)', background: task.completed ? 'rgba(134,239,172,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        {task.completed ? '✓' : ''}
      </div>
      <div style={{ fontSize: 24, color: task.completed ? '#94a3b8' : '#fff', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
    </div>
  );
}

function FullScreenTasksMode({ tasks, activeTaskGroupIndex, tasksSourceLabel }) {
  const groups = useMemo(() => {
    const taskGroups = tasks?.groups || {};
    const completed = taskGroups.completed || [];
    return [
      { key: 'open', title: 'Open', accent: '#7dd3fc', items: taskGroups.open || [] },
      ...(completed.length > 0 ? [{ key: 'completed', title: 'Completed', accent: '#86efac', items: completed }] : [])
    ];
  }, [tasks]);

  const activeGroup = groups[activeTaskGroupIndex] || groups[0];

  return (
    <Card style={{ height: '100%', padding: 28, boxSizing: 'border-box', background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.72))', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle>Google Tasks</SectionTitle>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.25fr 0.38fr', gap: 20, minHeight: 0 }}>
        <div style={{ borderRadius: 20, border: `1px solid ${activeGroup.accent}33`, background: 'rgba(255,255,255,0.03)', padding: 22, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, letterSpacing: 4, color: activeGroup.accent, textTransform: 'uppercase' }}>{activeGroup.title}</div>
              <div style={{ fontSize: 38, lineHeight: 1.1, fontWeight: 700, marginTop: 6 }}>{activeGroup.items.length} items</div>
            </div>
            <div style={{ fontSize: 16, color: '#b9c6d8' }}>{tasksSourceLabel}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, justifyContent: activeGroup.items.length === 0 ? 'center' : 'flex-start', alignItems: activeGroup.items.length === 0 ? 'center' : 'stretch', animation: 'fadeSlide 600ms ease' }} key={activeGroup.key}>
            {activeGroup.items.length === 0
              ? <div style={{ fontSize: 26, color: '#b9c6d8' }}>No {activeGroup.title} Tasks</div>
              : activeGroup.items.slice(0, 6).map((task) => (
                  <TaskRow key={task.id} task={task} accentColor={activeGroup.accent} dimmed={activeGroup.key === 'completed'} />
                ))
            }
          </div>
        </div>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          {groups.map((group, index) => {
            const selected = activeGroup.key === group.key;
            return (
              <div key={group.key} style={{ padding: 18, borderRadius: 18, border: selected ? `1px solid ${group.accent}55` : '1px solid rgba(255,255,255,0.08)', background: selected ? 'rgba(125,211,252,0.08)' : 'rgba(255,255,255,0.04)', transition: 'all 400ms ease', transform: selected ? 'translateX(-4px)' : 'translateX(0)' }}>
                <div style={{ fontSize: 13, letterSpacing: 3, color: group.accent, textTransform: 'uppercase' }}>{group.title}</div>
                <div style={{ fontSize: 36, fontWeight: 700, marginTop: 6 }}>{group.items.length}</div>
                <div style={{ fontSize: 13, color: '#b9c6d8', marginTop: 6 }}>{selected ? 'Showing' : `${index + 1} of ${groups.length}`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function WodMode({ wod }) {
  if (!wod) return (
    <Card style={{ height: '100%', padding: 36, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 28, color: '#d8e2ef' }}>Loading word of the day…</div>
    </Card>
  );
  return (
    <Card style={{ height: '100%', padding: 36, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.72))' }}>
      <SectionTitle>Word of the Day</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1 }}>{wod.word}</div>
        {wod.pronunciation && <div style={{ fontSize: 26, color: '#7dd3fc', fontStyle: 'italic' }}>{wod.pronunciation}</div>}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0, overflow: 'hidden' }}>
        {wod.meanings.map((meaning, i) => (
          <div key={i}>
            <div style={{ fontSize: 16, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 10 }}>{meaning.partOfSpeech}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {meaning.definitions.map((def, j) => (
                <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {meaning.definitions.length > 1 && <div style={{ fontSize: 18, color: '#7dd3fc', minWidth: 22, marginTop: 4 }}>{j + 1}.</div>}
                  <div style={{ fontSize: 28, color: '#d8e2ef', lineHeight: 1.4 }}>{def}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {meaning.synonyms.length > 0 && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, letterSpacing: 2, color: '#7dd3fc', textTransform: 'uppercase' }}>Synonyms</span>
                  {meaning.synonyms.slice(0, 5).map((s) => (
                    <span key={s} style={{ fontSize: 18, color: '#b9c6d8', background: 'rgba(125,211,252,0.08)', padding: '3px 12px', borderRadius: 999, border: '1px solid rgba(125,211,252,0.2)' }}>{s}</span>
                  ))}
                </div>
              )}
              {meaning.antonyms.length > 0 && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, letterSpacing: 2, color: '#f87171', textTransform: 'uppercase' }}>Antonyms</span>
                  {meaning.antonyms.slice(0, 5).map((a) => (
                    <span key={a} style={{ fontSize: 18, color: '#b9c6d8', background: 'rgba(248,113,113,0.08)', padding: '3px 12px', borderRadius: 999, border: '1px solid rgba(248,113,113,0.2)' }}>{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {wod.example && (
          <div style={{ borderLeft: '3px solid rgba(125,211,252,0.3)', paddingLeft: 22, marginTop: 'auto' }}>
            <div style={{ fontSize: 14, letterSpacing: 3, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: 6 }}>Example</div>
            <div style={{ fontSize: 24, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5 }}>{wod.example}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

function MainZone(props) {
  const style = { height: '100%', padding: 24, boxSizing: 'border-box', animation: 'fadeSlide 600ms ease' };
  switch (props.mode) {
    case 'weather': return <WeatherMode weather={props.weather} />;
    case 'trends': return <Card style={style}><TrendsMode items={props.trends} /></Card>;
    case 'stocks': return <Card style={style}><StocksMode items={props.stocks} /></Card>;
    case 'wod': return <WodMode wod={props.wod} />;
    case 'learning': return <LearningMode learning={props.learning} />;
    case 'tasks': return <FullScreenTasksMode tasks={props.tasks} activeTaskGroupIndex={props.activeTaskGroupIndex} tasksSourceLabel={props.tasksSourceLabel} />;
    case 'nythome': return <Card style={style}><NytHomeMode items={props.nytHome} /></Card>;
    case 'nyttech':
    default:
      return <Card style={style}><NytTechMode items={props.nytTech} /></Card>;
  }
}

export default function App() {
  const { timeText, dateText, weather, nytHome, nytTech, trends, stocks, tasks, wod, learning, currentMode, error, updatedAt, rotationPaused, lastRemoteAction, remoteSupported, activeTaskGroupIndex } = useDashboardData();

  const tasksSourceLabel = tasks?.configured ? (tasks?.listName || 'Google Tasks') : 'Sample tasks';

  const [legendVisible, setLegendVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLegendVisible(false), 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', color: '#fff', background: 'radial-gradient(circle at top, #1e3a5f 0%, #0f172a 45%, #020617 100%)', boxSizing: 'border-box', padding: 20 }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ height: '100%', borderRadius: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.4)', display: 'grid', gridTemplateRows: '120px 1fr auto', gap: 16 }}>

        {/* Header row: clock + weather */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16, minHeight: 0, overflow: 'hidden' }}>
          <Card style={{ padding: '10px 20px', position: 'relative', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 62, lineHeight: 1, fontWeight: 700 }}>{timeText}</div>
            <div>
              <div style={{ fontSize: 18, color: '#d8e2ef' }}>{dateText}</div>
              {updatedAt ? <div style={{ fontSize: 13, color: '#7dd3fc', marginTop: 3 }}>Updated {new Date(updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div> : null}
            </div>
            <div style={{ position: 'absolute', right: 16, top: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: rotationPaused ? '#facc15' : '#22c55e', boxShadow: `0 0 10px ${rotationPaused ? '#facc15' : '#22c55e'}` }} />
              <div style={{ fontSize: 13, color: '#d8e2ef' }}>{rotationPaused ? 'Paused' : 'Auto'}</div>
            </div>
          </Card>
          <WeatherPanel weather={weather} />
        </div>

        {/* Main zone */}
        <div style={{ position: 'relative', minHeight: 0, overflow: 'hidden' }}>
          <MainZone mode={currentMode} weather={weather} nytHome={nytHome} nytTech={nytTech} trends={trends} stocks={stocks} tasks={tasks} wod={wod} learning={learning} activeTaskGroupIndex={activeTaskGroupIndex} tasksSourceLabel={tasksSourceLabel} />
          {lastRemoteAction ? (
            <div style={{ position: 'absolute', top: 16, right: 16, padding: '10px 16px', borderRadius: 12, background: 'rgba(2,6,23,0.82)', border: '1px solid rgba(125,211,252,0.3)', color: '#e2e8f0', fontSize: 18, backdropFilter: 'blur(8px)', visibility: 'hidden' }}>
              {lastRemoteAction}
            </div>
          ) : null}
        </div>

        {/* Footer: stock strip */}
        <Card style={{ padding: '12px 18px', height: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, height: 80 }}>
            {stocks.map((stock) => (
              <div key={stock.symbol} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: '1fr 1fr', gap: '0 8px', alignItems: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{stock.symbol}</div>
                <div style={{ fontSize: 18, color: stock.positive ? '#86efac' : '#fca5a5', textAlign: 'right' }}>{stock.change}</div>
                <div style={{ fontSize: 18, color: '#d8e2ef' }}>{stock.price}</div>
                <div style={{ position: 'relative', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }}>
                  {stock.high > stock.low && (
                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: `${((stock.current - stock.low) / (stock.high - stock.low)) * 100}%`, width: 8, height: 18, borderRadius: 3, background: stock.positive ? '#86efac' : '#f87171', marginLeft: -4 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ overflow: 'hidden', maxHeight: legendVisible ? 60 : 0, opacity: legendVisible ? 1 : 0, transition: 'max-height 1s ease, opacity 1s ease', marginTop: legendVisible ? 10 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, color: '#b9c6d8', fontSize: 13 }}>
                <div style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>← → Switch mode</div>
                <div style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>Enter Pause/Resume</div>
                <div style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>↑ Refresh</div>
                <div style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>↓ Tasks</div>
              </div>
              <div style={{ fontSize: 13, color: remoteSupported ? '#7dd3fc' : '#94a3b8' }}>
                {remoteSupported ? 'Samsung TV remote detected' : 'Keyboard controls active'}
              </div>
            </div>
          </div>
          {error ? <div style={{ marginTop: 8, color: '#fca5a5', fontSize: 14 }}>Data warning: {error}</div> : null}
        </Card>

      </div>
    </div>
  );
}
