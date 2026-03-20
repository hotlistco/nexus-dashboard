import { useCallback, useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '../lib/api';
import { initTizenRemoteKeys, isTizenDevice } from '../lib/tizenRemote';

const modes = ['news', 'trends', 'stocks', 'learning', 'tasks'];
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
    title: 'Forecast cadence',
    body: 'OpenWeather recommends calling its One Call API periodically; current data can update on short intervals, so caching avoids needless traffic.'
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
    news: [],
    trends: [],
    stocks: [],
    tasks: [],
    error: null,
    updatedAt: null
  });
  const [modeIndex, setModeIndex] = useState(0);
  const [learningIndex, setLearningIndex] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [lastRemoteAction, setLastRemoteAction] = useState('');
  const [clock, setClock] = useState(getNowStrings);

  const setRemoteAction = useCallback((message) => {
    setLastRemoteAction(message);
    window.clearTimeout(globalThis.__tviewRemoteToastTimeout);
    globalThis.__tviewRemoteToastTimeout = window.setTimeout(() => {
      setLastRemoteAction('');
    }, 2200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [weather, news, trends, stocks, tasks] = await Promise.all([
        dashboardApi.getWeather(),
        dashboardApi.getNews(),
        dashboardApi.getTrends(),
        dashboardApi.getStocks(),
        dashboardApi.getTasks()
      ]);

      setData({
        weather,
        news: news.items || [],
        trends: trends.items || [],
        stocks: stocks.items || [],
        tasks: tasks.items || [],
        error: null,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      setData((current) => ({ ...current, error: error.message }));
    }
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
    const intervalId = window.setInterval(() => {
      nextMode();
    }, 20000);
    return () => window.clearInterval(intervalId);
  }, [rotationPaused, nextMode]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLearningIndex((current) => (current + 1) % learningPool.length);
    }, 25000);
    return () => window.clearInterval(intervalId);
  }, []);

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
          toggleRotationPaused();
          setRemoteAction(rotationPaused ? 'Auto-rotate resumed' : 'Auto-rotate paused');
          event.preventDefault();
          break;
        case 'MediaPlayPause':
        case 'MediaPlay':
        case 'MediaPause':
          toggleRotationPaused();
          setRemoteAction(rotationPaused ? 'Auto-rotate resumed' : 'Auto-rotate paused');
          event.preventDefault();
          break;
        case 'ColorF0Red':
          refresh();
          setRemoteAction('Refreshing data');
          event.preventDefault();
          break;
        case 'ColorF1Green':
          jumpToMode('news');
          setRemoteAction('Mode: news');
          event.preventDefault();
          break;
        case 'ColorF2Yellow':
          jumpToMode('stocks');
          setRemoteAction('Mode: stocks');
          event.preventDefault();
          break;
        case 'ColorF3Blue':
          jumpToMode('tasks');
          setRemoteAction('Mode: tasks');
          event.preventDefault();
          break;
        case 'ArrowUp':
          refresh();
          setRemoteAction('Refreshing data');
          event.preventDefault();
          break;
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
      window.clearTimeout(globalThis.__tviewRemoteToastTimeout);
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
      remoteSupported: isTizenDevice()
    }),
    [data, clock, modeIndex, learningIndex, refresh, rotationPaused, lastRemoteAction]
  );
}
