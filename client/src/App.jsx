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
  return `/weather-icons/${name}.svg`;
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ fontSize: 16, letterSpacing: 4, color: '#b9c6d8', textTransform: 'uppercase' }}>{children}</div>
      {right ? <div style={{ color: '#7dd3fc', fontSize: 14 }}>{right}</div> : null}
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
      <SectionTitle right="Mode B">5-Day Forecast</SectionTitle>
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
              <div>🌅 {current.sunrise} &nbsp; 🌇 {current.sunset}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, minHeight: 0 }}>
            {forecast.map((day) => (
              <div key={day.day} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, padding: '16px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 26, fontWeight: 600, color: '#d8e2ef' }}>{day.day}</div>
                <img src={weatherIcon(day.iconCode)} alt={day.description} style={{ width: 80, height: 80 }} />
                <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'capitalize', minHeight: 44, display: 'flex', alignItems: 'center', textAlign: 'center' }}>{day.description}</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{day.high} <span style={{ fontSize: 24, color: '#94a3b8', fontWeight: 400 }}>{day.low}</span></div>
                <div style={{ fontSize: 18, color: '#7dd3fc' }}>💧 {day.pop}{day.precip ? ` · ${day.precip}` : ''}</div>
                {day.wind ? <div style={{ fontSize: 17, color: '#b9c6d8' }}>🌬️ {day.wind}</div> : null}
              </div>
            ))}
          </div>
        </>
      ) : <div style={{ fontSize: 24, color: '#d8e2ef' }}>Loading weather…</div>}
    </Card>
  );
}

function NewsMode({ items }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle right="Mode A">News headlines</SectionTitle>
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1.3fr 1fr', gap: 14, minHeight: 0 }}>
        {items[0] ? (
          <Card style={{ padding: 24, overflow: 'hidden', backgroundImage: `linear-gradient(rgba(2,6,23,0.35), rgba(2,6,23,0.65)), url(${items[0].image || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ fontSize: 36, lineHeight: 1.15, fontWeight: 650, maxWidth: '82%' }}>{items[0].title}</div>
            <div style={{ marginTop: 12, fontSize: 18, color: '#d8e2ef' }}>{items[0].source} · {items[0].published}</div>
          </Card>
        ) : <Card style={{ padding: 24, fontSize: 24 }}>No headlines available.</Card>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {items.slice(1, 3).map((item) => (
            <Card key={item.title} style={{ padding: 20, overflow: 'hidden' }}>
              <div style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 600 }}>{item.title}</div>
              <div style={{ marginTop: 12, fontSize: 16, color: '#b9c6d8' }}>{item.source}</div>
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

function TrendsMode({ items }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle right="Mode B">Trending searches</SectionTitle>
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: `repeat(${items.length}, 1fr)`, gap: 10, minHeight: 0 }}>
        {items.map((item, index) => (
          <Card key={item.query} style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '70px 1fr auto', alignItems: 'center' }}>
            <div style={{ fontSize: 24, color: '#b9c6d8' }}>#{index + 1}</div>
            <div style={{ fontSize: 26, fontWeight: 600 }}>{item.query}</div>
            <div style={{ fontSize: 18, color: '#7dd3fc' }}>{formatVolume(item.volume)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StocksMode({ items }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle right="Mode C">Detailed stocks</SectionTitle>
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
      <SectionTitle right="Mode D">{learning.type}</SectionTitle>
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
    return [
      { key: 'open', title: 'Open', accent: '#7dd3fc', items: taskGroups.open || [] },
      { key: 'completed', title: 'Completed', accent: '#86efac', items: taskGroups.completed || [] }
    ].filter((group) => group.items.length > 0);
  }, [tasks]);

  const activeGroup = groups[activeTaskGroupIndex] || groups[0] || null;

  if (!activeGroup) {
    return (
      <Card style={{ height: '100%', padding: 32, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 28, color: '#d8e2ef' }}>No tasks available.</div>
      </Card>
    );
  }

  return (
    <Card style={{ height: '100%', padding: 28, boxSizing: 'border-box', background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.72))', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle right="Mode E">Google Tasks</SectionTitle>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.25fr 0.38fr', gap: 20, minHeight: 0 }}>
        <div style={{ borderRadius: 20, border: `1px solid ${activeGroup.accent}33`, background: 'rgba(255,255,255,0.03)', padding: 22, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, letterSpacing: 4, color: activeGroup.accent, textTransform: 'uppercase' }}>{activeGroup.title}</div>
              <div style={{ fontSize: 38, lineHeight: 1.1, fontWeight: 700, marginTop: 6 }}>{activeGroup.items.length} items</div>
            </div>
            <div style={{ fontSize: 16, color: '#b9c6d8' }}>{tasksSourceLabel}</div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateRows: `repeat(${Math.min(activeGroup.items.length, 6)}, 1fr)`, gap: 10, minHeight: 0, animation: 'fadeSlide 600ms ease' }} key={activeGroup.key}>
            {activeGroup.items.slice(0, 6).map((task) => (
              <TaskRow key={task.id} task={task} accentColor={activeGroup.accent} dimmed={activeGroup.key === 'completed'} />
            ))}
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
    <Card style={{ height: '100%', padding: 36, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.72))' }}>
      <SectionTitle>Word of the Day</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 12 }}>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1 }}>{wod.word}</div>
        {wod.pronunciation && <div style={{ fontSize: 28, color: '#7dd3fc', fontStyle: 'italic' }}>{wod.pronunciation}</div>}
        {wod.partOfSpeech && <div style={{ fontSize: 22, color: '#94a3b8', fontStyle: 'italic' }}>{wod.partOfSpeech}</div>}
      </div>
      <div style={{ fontSize: 32, color: '#d8e2ef', lineHeight: 1.5, marginBottom: 28 }}>{wod.definition}</div>
      {wod.example && (
        <div style={{ borderLeft: '3px solid #7dd3fc44', paddingLeft: 24 }}>
          <div style={{ fontSize: 16, letterSpacing: 3, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: 8 }}>Example</div>
          <div style={{ fontSize: 26, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5 }}>{wod.example}</div>
        </div>
      )}
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
    case 'news':
    default:
      return <Card style={style}><NewsMode items={props.news} /></Card>;
  }
}

export default function App() {
  const { timeText, dateText, weather, news, trends, stocks, tasks, wod, learning, currentMode, error, updatedAt, rotationPaused, lastRemoteAction, remoteSupported, activeTaskGroupIndex } = useDashboardData();

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
          <MainZone mode={currentMode} weather={weather} news={news} trends={trends} stocks={stocks} tasks={tasks} wod={wod} learning={learning} activeTaskGroupIndex={activeTaskGroupIndex} tasksSourceLabel={tasksSourceLabel} />
          {lastRemoteAction ? (
            <div style={{ position: 'absolute', top: 16, right: 16, padding: '10px 16px', borderRadius: 12, background: 'rgba(2,6,23,0.82)', border: '1px solid rgba(125,211,252,0.3)', color: '#e2e8f0', fontSize: 18, backdropFilter: 'blur(8px)' }}>
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
