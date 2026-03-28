import { useCallback, useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '../lib/api';
import { initTizenRemoteKeys, isTizenDevice } from '../lib/tizenRemote';

const modes = ['nythome', 'nyttech', 'weather', 'trends', 'stocks', 'wod', 'tasks'];
const modeDurationsMs = {
  nythome: 60000,
  nyttech: 60000,
  weather: 20000,
  trends: 60000,
  stocks: 16000,
  wod: 30000,
  tasks: 30000
};

const fallbackTasks = {
  source: 'fallback',
  configured: false,
  listName: 'Sample Tasks',
  items: [
    { id: '1', title: 'Unable to fetch actual tasks', completed: false, status: 'needsAction' },
    { id: '2', title: 'Break task api call', completed: true, status: 'completed' }
  ],
  groups: {
    open: [
      { id: '1', title: 'Unable to fetch actual tasks', completed: false, status: 'needsAction' },
    ],
    completed: [
      { id: '2', title: 'Break task api call', completed: true, status: 'completed' }
    ]
  }
};

const learningPool = [
  {
    type: 'Quote',
    title: 'Make it obvious.',
    body: 'Good ambient screens work at a glance. If it takes effort to parse, it belongs on a laptop, not a living-room TV.'
  },
  {
    type: 'Vocabulary',
    title: 'Laconic',
    body: 'Using very few words. A useful trait for dashboard labels that need to be read from across the room.'
  },
  {
    type: 'Fact',
    title: 'Canned Data',
    body: 'This is canned data, not fresh.'
  }
];

function getNowStrings() {
  const now = new Date();
  return {
    timeText: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(now),
    dateText: new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(now)
  };
}

export function useDashboardData() {
  const [data, setData] = useState({
    weather: null,
    nytHome: [],
    nytTech: [],
    trends: [],
    stocks: [],
    tasks: fallbackTasks,
    wod: null,
    error: null,
    updatedAt: null
  });
  const [modeIndex, setModeIndex] = useState(0);
  const [learningIndex, setLearningIndex] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [lastRemoteAction, setLastRemoteAction] = useState('');
  const [clock, setClock] = useState(getNowStrings);
  const [activeTaskGroupIndex, setActiveTaskGroupIndex] = useState(0);

  const setRemoteAction = useCallback((message) => {
    setLastRemoteAction(message);
    window.clearTimeout(globalThis.__nexusRemoteToastTimeout);
    globalThis.__nexusRemoteToastTimeout = window.setTimeout(() => {
      setLastRemoteAction('');
    }, 2200);
  }, []);

  const refresh = useCallback(async () => {
    const [weatherResult, nytHomeResult, nytTechResult, trendsResult, stocksResult, tasksResult, wodResult] = await Promise.allSettled([
      dashboardApi.getWeather(),
      dashboardApi.getNytHome(),
      dashboardApi.getNytTech(),
      dashboardApi.getTrends(),
      dashboardApi.getStocks(),
      dashboardApi.getTasks(),
      dashboardApi.getWod()
    ]);

    const errors = [];

    setData((current) => {
      const next = { ...current, updatedAt: new Date().toISOString() };

      if (weatherResult.status === 'fulfilled') next.weather = weatherResult.value;
      else errors.push(`Weather: ${weatherResult.reason?.message || 'failed'}`);

      if (nytHomeResult.status === 'fulfilled') next.nytHome = nytHomeResult.value.items || [];
      else errors.push(`NYT Home: ${nytHomeResult.reason?.message || 'failed'}`);

      if (nytTechResult.status === 'fulfilled') next.nytTech = nytTechResult.value.items || [];
      else errors.push(`NYT Tech: ${nytTechResult.reason?.message || 'failed'}`);

      if (trendsResult.status === 'fulfilled') next.trends = trendsResult.value.items || [];
      else errors.push(`Trends: ${trendsResult.reason?.message || 'failed'}`);

      if (stocksResult.status === 'fulfilled') next.stocks = stocksResult.value.items || [];
      else errors.push(`Stocks: ${stocksResult.reason?.message || 'failed'}`);

      if (tasksResult.status === 'fulfilled') next.tasks = tasksResult.value?.groups ? tasksResult.value : fallbackTasks;
      else {
        errors.push(`Tasks: ${tasksResult.reason?.message || 'failed'}`);
        if (!current.tasks?.groups) next.tasks = fallbackTasks;
      }

      if (wodResult.status === 'fulfilled') next.wod = wodResult.value;
      else errors.push(`WoD: ${wodResult.reason?.message || 'failed'}`);

      next.error = errors.length > 0 ? errors.join(' · ') : null;
      return next;
    });
  }, []);

  const nextMode = useCallback(() => {
    setModeIndex((current) => (current + 1) % modes.length);
  }, []);

  const previousMode = useCallback(() => {
    setModeIndex((current) => (current - 1 + modes.length) % modes.length);
  }, []);

  const jumpToMode = useCallback((modeName) => {
    const targetIndex = modes.indexOf(modeName);
    if (targetIndex >= 0) setModeIndex(targetIndex);
  }, []);

  const toggleRotationPaused = useCallback(() => {
    setRotationPaused((current) => !current);
  }, []);

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(refresh, 5 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(getNowStrings());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (rotationPaused) return undefined;
    const currentMode = modes[modeIndex];
    const timeoutId = window.setTimeout(() => {
      nextMode();
    }, modeDurationsMs[currentMode] || 18000);
    return () => window.clearTimeout(timeoutId);
  }, [modeIndex, rotationPaused, nextMode]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLearningIndex((current) => (current + 1) % learningPool.length);
    }, 12000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (modes[modeIndex] !== 'tasks') return undefined;

    const groups = [
      ...(data.tasks?.groups?.open || []).length ? ['open'] : [],
      ...(data.tasks?.groups?.completed || []).length ? ['completed'] : []
    ];

    if (groups.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveTaskGroupIndex((current) => (current + 1) % groups.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [modeIndex, data.tasks]);

  useEffect(() => {
    initTizenRemoteKeys();

    const onKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          previousMode();
          setRemoteAction(`Mode: ${modes[(modeIndex - 1 + modes.length) % modes.length]}`);
          event.preventDefault();
          break;
        case 'ArrowRight':
          nextMode();
          setRemoteAction(`Mode: ${modes[(modeIndex + 1) % modes.length]}`);
          event.preventDefault();
          break;
        case 'Enter':
        case 'MediaPlayPause':
        case 'MediaPlay':
        case 'MediaPause':
          toggleRotationPaused();
          setRemoteAction(rotationPaused ? 'Auto-rotate resumed' : 'Auto-rotate paused');
          event.preventDefault();
          break;
        case 'ColorF0Red':
        case 'ArrowUp':
          refresh();
          setRemoteAction('Refreshing data');
          event.preventDefault();
          break;
        case 'ColorF2Yellow':
          jumpToMode('stocks');
          setRemoteAction('Mode: stocks');
          event.preventDefault();
          break;
        case 'ColorF3Blue':
        case 'ArrowDown':
          jumpToMode('tasks');
          setRemoteAction('Mode: tasks');
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(globalThis.__nexusRemoteToastTimeout);
    };
  }, [jumpToMode, modeIndex, nextMode, previousMode, refresh, rotationPaused, setRemoteAction, toggleRotationPaused]);

  return useMemo(
    () => ({
      ...data,
      timeText: clock.timeText,
      dateText: clock.dateText,
      currentMode: modes[modeIndex],
      learning: learningPool[learningIndex],
      refresh,
      rotationPaused,
      lastRemoteAction,
      remoteSupported: isTizenDevice(),
      activeTaskGroupIndex,
      wod: data.wod,
      nytHome: data.nytHome,
      nytTech: data.nytTech
    }),
    [data, clock, modeIndex, learningIndex, refresh, rotationPaused, lastRemoteAction, activeTaskGroupIndex]
  );
}
