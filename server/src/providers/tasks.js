import { google } from 'googleapis';

function normalizeTask(task) {
  const title = (task.title || '').trim();
  const status = task.status || 'needsAction';
  const completed = status === 'completed';

  let due = null;
  if (task.due) {
    const d = new Date(task.due);
    if (!Number.isNaN(d.getTime())) {
      due = d.toISOString();
    }
  }

  return {
    id: task.id,
    title,
    completed,
    status,
    due,
    updated: task.updated || null,
  };
}

function classifyTask(task) {
  if (task.completed) return 'completed';
  if (!task.due) return 'upcoming';

  const now = new Date();
  const due = new Date(task.due);

  // Compare by local day to make TV display behavior more intuitive.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (dueDay < today) return 'overdue';
  if (dueDay.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}

function sortTasks(tasks) {
  const rank = {
    overdue: 0,
    today: 1,
    upcoming: 2,
    completed: 3,
  };

  return [...tasks].sort((a, b) => {
    const aClass = classifyTask(a);
    const bClass = classifyTask(b);

    if (rank[aClass] !== rank[bClass]) {
      return rank[aClass] - rank[bClass];
    }

    // Within a class, earlier due dates first.
    if (a.due && b.due) {
      const diff = new Date(a.due).getTime() - new Date(b.due).getTime();
      if (diff !== 0) return diff;
    } else if (a.due && !b.due) {
      return -1;
    } else if (!a.due && b.due) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });
}

export async function getTasks(env) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_TASKS_LIST = 'My Tasks',
  } = env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return {
      source: 'google-tasks',
      configured: false,
      error: 'Google Tasks is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.',
      listName: GOOGLE_TASKS_LIST,
      items: [],
      groups: {
        overdue: [],
        today: [],
        upcoming: [],
        completed: [],
      },
      summary: {
        total: 0,
        overdue: 0,
        today: 0,
        upcoming: 0,
        completed: 0,
      },
    };
  }

  const auth = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI || 'http://127.0.0.1:3000/oauth2callback'
  );

  auth.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });

  const tasksApi = google.tasks({
    version: 'v1',
    auth,
  });

  const taskListsResponse = await tasksApi.tasklists.list({
    maxResults: 100,
  });

  const taskLists = taskListsResponse.data.items || [];
  const selectedList =
    taskLists.find((list) => list.title === GOOGLE_TASKS_LIST) ||
    taskLists[0] ||
    null;

  if (!selectedList?.id) {
    return {
      source: 'google-tasks',
      configured: true,
      error: `No Google task list found. Checked for "${GOOGLE_TASKS_LIST}".`,
      listName: GOOGLE_TASKS_LIST,
      availableLists: taskLists.map((list) => ({
        id: list.id,
        title: list.title,
      })),
      items: [],
      groups: {
        overdue: [],
        today: [],
        upcoming: [],
        completed: [],
      },
      summary: {
        total: 0,
        overdue: 0,
        today: 0,
        upcoming: 0,
        completed: 0,
      },
    };
  }

  const tasksResponse = await tasksApi.tasks.list({
    tasklist: selectedList.id,
    maxResults: 100,
    showCompleted: true,
    showHidden: false,
    showDeleted: false,
  });

  const rawItems = tasksResponse.data.items || [];

  const items = sortTasks(
    rawItems
      .map(normalizeTask)
      .filter((task) => task.title)
  );

  const groups = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  };

  for (const task of items) {
    groups[classifyTask(task)].push(task);
  }

  return {
    source: 'google-tasks',
    configured: true,
    listName: selectedList.title,
    selectedListId: selectedList.id,
    items: items.slice(0, 20),
    groups: {
      overdue: groups.overdue.slice(0, 10),
      today: groups.today.slice(0, 10),
      upcoming: groups.upcoming.slice(0, 10),
      completed: groups.completed.slice(0, 10),
    },
    summary: {
      total: items.length,
      overdue: groups.overdue.length,
      today: groups.today.length,
      upcoming: groups.upcoming.length,
      completed: groups.completed.length,
    },
  };
}

