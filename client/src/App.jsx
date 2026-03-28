import { useMemo } from 'react';
import { useDashboardData } from './hooks/useDashboardData';

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ fontSize: 18, letterSpacing: 4, color: '#b9c6d8', textTransform: 'uppercase' }}>{children}</div>
      {right ? <div style={{ color: '#7dd3fc', fontSize: 16 }}>{right}</div> : null}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 28,
      boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
      backdropFilter: 'blur(16px)',
      ...style
    }}>{children}</div>
  );
}

function WeatherPanel({ weather }) {
  const current = weather?.current;
  const forecast = weather?.forecast || [];
  return (
    <Card style={{ padding: 28, background: 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(255,255,255,0.04))' }}>
      <SectionTitle>Weather</SectionTitle>
      {current ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 64 }}>{current.icon}</div>
              <div>
                <div style={{ fontSize: 64, fontWeight: 700 }}>{current.temp}</div>
                <div style={{ fontSize: 28, color: '#d8e2ef' }}>{current.summary}</div>
                <div style={{ fontSize: 24, color: '#b9c6d8' }}>{current.location}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 22, color: '#d8e2ef' }}>
              <div>Feels like {current.feelsLike}</div>
              <div>{current.detail}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 24 }}>
            {forecast.map((day) => (
              <div key={day.day} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#b9c6d8', marginBottom: 8 }}>{day.day}</div>
                <div style={{ fontSize: 34 }}>{day.icon}</div>
                <div style={{ fontSize: 22, marginTop: 8 }}>{day.high}</div>
                <div style={{ fontSize: 18, color: '#b9c6d8' }}>{day.low}</div>
              </div>
            ))}
          </div>
        </>
      ) : <div style={{ fontSize: 28, color: '#d8e2ef' }}>Loading weather…</div>}
    </Card>
  );
}

function NewsMode({ items }) {
  return (
    <div>
      <SectionTitle right="Mode A">News headlines</SectionTitle>
      <div style={{ display: 'grid', gridTemplateRows: '1.15fr 1fr', gap: 18, height: '100%' }}>
        {items[0] ? (
          <Card style={{ padding: 28, backgroundImage: `linear-gradient(rgba(2,6,23,0.35), rgba(2,6,23,0.6)), url(${items[0].image || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ fontSize: 44, lineHeight: 1.12, fontWeight: 650, maxWidth: '82%' }}>{items[0].title}</div>
            <div style={{ marginTop: 18, fontSize: 22, color: '#d8e2ef' }}>{items[0].source} · {items[0].published}</div>
          </Card>
        ) : <Card style={{ padding: 28, fontSize: 28 }}>No headlines available.</Card>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {items.slice(1, 3).map((item) => (
            <Card key={item.title} style={{ padding: 24 }}>
              <div style={{ fontSize: 28, lineHeight: 1.2, fontWeight: 600 }}>{item.title}</div>
              <div style={{ marginTop: 16, fontSize: 20, color: '#b9c6d8' }}>{item.source}</div>
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
    <div>
      <SectionTitle right="Mode B">Trending searches</SectionTitle>
      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((item, index) => (
          <Card key={item.query} style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '90px 1fr 140px', alignItems: 'center' }}>
            <div style={{ fontSize: 30, color: '#b9c6d8' }}>#{index + 1}</div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>{item.query}</div>
            <div style={{ fontSize: 24, color: '#7dd3fc', textAlign: 'right' }}>{formatVolume(item.volume)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StocksMode({ items }) {
  return (
    <div>
      <SectionTitle right="Mode C">Detailed stocks</SectionTitle>
      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((stock) => (
          <Card key={stock.symbol} style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '120px 170px 160px 1fr', alignItems: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{stock.symbol}</div>
            <div style={{ fontSize: 28 }}>{stock.price}</div>
            <div style={{ fontSize: 24, color: stock.positive ? '#86efac' : '#fca5a5' }}>{stock.change}</div>
            <div style={{ height: 44, borderRadius: 999, background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(125,211,252,0.18), rgba(255,255,255,0.04))' }} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function LearningMode({ learning }) {
  return (
    <Card style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 700 }}>
      <SectionTitle right="Mode D">{learning.type}</SectionTitle>
      <div style={{ fontSize: 64, lineHeight: 1.12, fontWeight: 650, maxWidth: '88%' }}>{learning.title}</div>
      <div style={{ marginTop: 28, fontSize: 34, lineHeight: 1.32, color: '#d8e2ef', maxWidth: '86%' }}>{learning.body}</div>
    </Card>
  );
}

function TaskRow({ task, accentColor = '#ffffff', dimmed = false }) {
  return (
    <div style={{
      padding: '22px 24px',
      display: 'grid',
      gridTemplateColumns: '48px 1fr',
      gap: 18,
      alignItems: 'center',
      borderRadius: 22,
      border: `1px solid ${accentColor}22`,
      background: dimmed ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.05)',
      transition: 'all 500ms ease'
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, border: task.completed ? '2px solid #86efac' : '2px solid rgba(255,255,255,0.4)', background: task.completed ? 'rgba(134,239,172,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {task.completed ? '✓' : ''}
      </div>
      <div style={{ fontSize: 30, color: task.completed ? '#94a3b8' : '#fff', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
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
      <Card style={{ minHeight: 860, padding: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 32, color: '#d8e2ef' }}>No tasks available.</div>
      </Card>
    );
  }

  return (
    <Card style={{ minHeight: 860, padding: 36, background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.72))' }}>
      <SectionTitle right="Mode E">Google Tasks</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.42fr', gap: 24, minHeight: 730 }}>
        <div style={{ borderRadius: 26, border: `1px solid ${activeGroup.accent}33`, background: 'rgba(255,255,255,0.03)', padding: 28, transition: 'all 500ms ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 18, letterSpacing: 4, color: activeGroup.accent, textTransform: 'uppercase' }}>{activeGroup.title}</div>
              <div style={{ fontSize: 46, lineHeight: 1.1, fontWeight: 700, marginTop: 10 }}>{activeGroup.items.length} items</div>
            </div>
            <div style={{ fontSize: 18, color: '#b9c6d8' }}>{tasksSourceLabel}</div>
          </div>
          <div style={{ display: 'grid', gap: 14, animation: 'fadeSlide 600ms ease' }} key={activeGroup.key}>
            {activeGroup.items.slice(0, 6).map((task) => (
              <TaskRow key={task.id} task={task} accentColor={activeGroup.accent} dimmed={activeGroup.key === 'completed'} />
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          {groups.map((group, index) => {
            const selected = activeGroup.key === group.key;
            return (
              <div key={group.key} style={{ padding: 22, borderRadius: 22, border: selected ? `1px solid ${group.accent}55` : '1px solid rgba(255,255,255,0.08)', background: selected ? 'rgba(125,211,252,0.08)' : 'rgba(255,255,255,0.04)', boxShadow: selected ? '0 0 0 1px rgba(125,211,252,0.14)' : 'none', transition: 'all 500ms ease', transform: selected ? 'translateX(-4px)' : 'translateX(0)' }}>
                <div style={{ fontSize: 16, letterSpacing: 3, color: group.accent, textTransform: 'uppercase' }}>{group.title}</div>
                <div style={{ fontSize: 42, fontWeight: 700, marginTop: 8 }}>{group.items.length}</div>
                <div style={{ fontSize: 16, color: '#b9c6d8', marginTop: 8 }}>{selected ? 'Live focus' : `Queue ${index + 1}`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function MainZone(props) {
  const style = {
    minHeight: 860,
    padding: 28,
    animation: 'fadeSlide 600ms ease'
  };

  switch (props.mode) {
    case 'trends': return <Card style={style}><TrendsMode items={props.trends} /></Card>;
    case 'stocks': return <Card style={style}><StocksMode items={props.stocks} /></Card>;
    case 'learning': return <LearningMode learning={props.learning} />;
    case 'tasks': return <FullScreenTasksMode tasks={props.tasks} activeTaskGroupIndex={props.activeTaskGroupIndex} tasksSourceLabel={props.tasksSourceLabel} />;
    case 'news':
    default:
      return <Card style={style}><NewsMode items={props.news} /></Card>;
  }
}

export default function App() {
  const { timeText, dateText, weather, news, trends, stocks, tasks, learning, currentMode, error, updatedAt, rotationPaused, lastRemoteAction, remoteSupported, activeTaskGroupIndex } = useDashboardData();

  const tasksSourceLabel = tasks?.configured ? (tasks?.listName || 'Google Tasks') : 'Sample tasks';

  return (
    <div style={{ minHeight: '100%', color: '#fff', padding: 60, background: 'radial-gradient(circle at top, #1e3a5f 0%, #0f172a 45%, #020617 100%)' }}>
      <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ maxWidth: 1740, margin: '0 auto', aspectRatio: '16 / 9', borderRadius: 34, padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.4)', display: 'grid', gridTemplateRows: '220px 1fr 170px', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 24 }}>
          <Card style={{ padding: 32, position: 'relative' }}>
            <div style={{ fontSize: 18, letterSpacing: 5, color: '#b9c6d8', textTransform: 'uppercase' }}>Nexus</div>
            <div style={{ fontSize: 118, lineHeight: 1, fontWeight: 700, marginTop: 8 }}>{timeText}</div>
            <div style={{ fontSize: 36, color: '#d8e2ef', marginTop: 12 }}>{dateText}</div>
            {updatedAt ? <div style={{ fontSize: 18, color: '#7dd3fc', marginTop: 12 }}>Updated {new Date(updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div> : null}
            <div style={{ position: 'absolute', right: 28, top: 28, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: rotationPaused ? '#facc15' : '#22c55e', boxShadow: `0 0 16px ${rotationPaused ? '#facc15' : '#22c55e'}` }} />
              <div style={{ fontSize: 16, color: '#d8e2ef' }}>{rotationPaused ? 'Paused' : 'Auto-rotate'}</div>
            </div>
          </Card>
          <WeatherPanel weather={weather} />
        </div>

        <div style={{ position: 'relative' }}>
          <MainZone mode={currentMode} news={news} trends={trends} stocks={stocks} tasks={tasks} learning={learning} activeTaskGroupIndex={activeTaskGroupIndex} tasksSourceLabel={tasksSourceLabel} />
          {lastRemoteAction ? (
            <div style={{ position: 'absolute', top: 22, right: 22, padding: '14px 18px', borderRadius: 16, background: 'rgba(2,6,23,0.78)', border: '1px solid rgba(125,211,252,0.3)', color: '#e2e8f0', fontSize: 20, backdropFilter: 'blur(8px)' }}>
              {lastRemoteAction}
            </div>
          ) : null}
        </div>

        <Card style={{ padding: 20 }}>
          <SectionTitle right={currentMode.toUpperCase()}>Stock strip</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {stocks.map((stock) => (
              <div key={stock.symbol} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{stock.symbol}</div>
                  <div style={{ fontSize: 22, color: stock.positive ? '#86efac' : '#fca5a5' }}>{stock.change}</div>
                </div>
                <div style={{ fontSize: 22, color: '#d8e2ef', marginTop: 10 }}>{stock.price}</div>
                <div style={{ height: 36, marginTop: 14, borderRadius: 999, background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(125,211,252,0.18), rgba(255,255,255,0.04))' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, color: '#b9c6d8', fontSize: 16 }}>
              <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>← → Switch mode</div>
              <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>Enter Play/Pause rotation</div>
              <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>↑ or Red refresh</div>
              <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>Blue tasks</div>
            </div>
            <div style={{ fontSize: 16, color: remoteSupported ? '#7dd3fc' : '#94a3b8' }}>
              {remoteSupported ? 'Samsung TV remote detected' : 'Keyboard controls also work in browser'}
            </div>
          </div>
          {error ? <div style={{ marginTop: 12, color: '#fca5a5', fontSize: 18 }}>Data warning: {error}</div> : null}
        </Card>
      </div>
    </div>
  );
}
