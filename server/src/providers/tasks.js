import { google } from 'googleapis';

export async function getTasks(env) {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI || 'http://localhost'
  );

  oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

  const tasksApi = google.tasks({ version: 'v1', auth: oauth2Client });
  const taskLists = await tasksApi.tasklists.list({ maxResults: 100 });
  const targetList = (taskLists.data.items || []).find((list) => list.title === (env.GOOGLE_TASKS_LIST || 'My Tasks')) || taskLists.data.items?.[0];
  if (!targetList?.id) return { configured: false, listName: null, items: [], groups: { open: [], completed: [] } };

  const tasks = await tasksApi.tasks.list({
    tasklist: targetList.id,
    maxResults: 100,
    showCompleted: true,
    showHidden: true,
    showDeleted: false
  });

  const items = (tasks.data.items || []).map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    completed: task.status === 'completed'
  }));

  return {
    configured: true,
    listName: targetList.title,
    items,
    groups: {
      open: items.filter((t) => !t.completed),
      completed: items.filter((t) => t.completed)
    }
  };
}
