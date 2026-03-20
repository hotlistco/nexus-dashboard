import { google } from 'googleapis';

function dueLabel(task) {
  if (!task.due) return 'No due date';
  const due = new Date(task.due);
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueDay - dayStart) / 86400000);
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
  if (!targetList?.id) return { items: [] };

  const tasks = await tasksApi.tasks.list({
    tasklist: targetList.id,
    maxResults: 10,
    showCompleted: true,
    showHidden: false,
    showDeleted: false
  });

  return {
    items: (tasks.data.items || []).slice(0, 7).map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueLabel: dueLabel(task),
      overdue: !!task.due && task.status !== 'completed' && new Date(task.due) < new Date()
    }))
  };
}
