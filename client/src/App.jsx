export default function NexusLivingRoomDashboardMockup() {
  const stocks = [
    { symbol: "AAPL", price: "$214.82", change: "+1.2%" },
    { symbol: "MSFT", price: "$468.14", change: "+0.6%" },
    { symbol: "NVDA", price: "$132.44", change: "+2.1%" },
    { symbol: "AMZN", price: "$201.90", change: "-0.4%" },
    { symbol: "GOOGL", price: "$176.52", change: "+0.9%" },
    { symbol: "TSLA", price: "$248.33", change: "-1.1%" },
  ];

  const weather = [
    { day: "Sat", icon: "☀️", high: "54°", low: "38°" },
    { day: "Sun", icon: "⛅", high: "57°", low: "40°" },
    { day: "Mon", icon: "🌧️", high: "49°", low: "36°" },
    { day: "Tue", icon: "☁️", high: "46°", low: "33°" },
    { day: "Wed", icon: "☀️", high: "52°", low: "35°" },
  ];

  const headlines = [
    "AI assistants continue expanding into search and productivity tools",
    "Spring travel demand rises as airlines add new domestic routes",
    "Major chipmakers announce new data center efficiency gains",
    "Streaming platforms push deeper into live events and sports",
  ];

  const trends = [
    "AI agents ↑",
    "March Madness bracket ↑",
    "Smart home hubs ↑",
    "Solar battery backup ↑",
    "EV incentives ↑",
  ];

  // Updated tasks with grouping
  const tasks = {
    overdue: [
      { text: "Schedule dentist appointment", done: false },
    ],
    today: [
      { text: "Call mom", done: false },
    ],
    upcoming: [
      { text: "Prep Monday priorities", done: false },
    ],
    completed: [
      { text: "Order household supplies", done: true },
    ]
  };

  const learnings = [
    {
      title: "Word of the day",
      body: "Antifragile — something that benefits from stress, volatility, or disorder.",
    },
    {
      title: "Did you know?",
      body: "The first weather satellite images were transmitted back to Earth in 1960.",
    },
    {
      title: "Quote",
      body: "‘We are what we repeatedly do. Excellence, then, is not an act, but a habit.’",
    },
  ];

  function TaskGroup({ title, items, color }) {
    if (!items.length) return null;

    return (
      <div>
        <div className={`text-xs uppercase tracking-[0.25em] mb-2 ${color}`}>{title}</div>
        <div className="space-y-2">
          {items.map((task) => (
            <div key={task.text} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2">
              <div className={`flex h-5 w-5 items-center justify-center rounded border ${task.done ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300' : 'border-slate-500 text-slate-400'}`}>
                {task.done ? '✓' : ''}
              </div>
              <div className={`${task.done ? 'line-through text-slate-500' : 'text-white'}`}>
                {task.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_45%,_#020617_100%)] text-white p-8">
      <div className="mx-auto aspect-video w-full max-w-[1600px] rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
        <div className="grid h-full grid-rows-[140px_1fr_96px] gap-5">

          {/* Header unchanged */}
          <div className="grid grid-cols-[1.05fr_1fr] gap-5">
            <div className="rounded-[28px] border border-white/10 bg-black/20 px-8 py-6 shadow-lg">
              <div className="text-sm uppercase tracking-[0.35em] text-slate-300">Nexus</div>
              <div className="mt-2 text-6xl font-semibold">7:42 PM</div>
              <div className="mt-3 text-2xl text-slate-200">Friday, March 20</div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-sky-500/20 via-cyan-400/10 to-white/5 px-6 py-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.28em] text-sky-100/80">Weather</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="text-5xl">⛅</div>
                    <div>
                      <div className="text-4xl font-semibold">52°</div>
                      <div className="text-slate-200">Partly cloudy · Hudson</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-right text-sm text-slate-100">
                  <div>Feels like 49°</div>
                  <div>Rain tomorrow</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-5 gap-3">
                {weather.map((item) => (
                  <div key={item.day} className="rounded-2xl bg-white/10 px-3 py-3 text-center">
                    <div className="text-xs uppercase tracking-wider text-slate-300">{item.day}</div>
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-sm font-medium">{item.high}</div>
                    <div className="text-xs text-slate-300">{item.low}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="grid grid-cols-[1.25fr_0.9fr] gap-5">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
              <div className="text-sm uppercase tracking-[0.3em] text-slate-300">Mode A · News</div>
              <div className="space-y-3 mt-4">
                {headlines.map((h) => (
                  <div key={h} className="bg-white/5 p-4 rounded-xl text-xl">{h}</div>
                ))}
              </div>
            </div>

            {/* TASKS (updated UI) */}
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="text-sm uppercase tracking-[0.3em] text-slate-300">Mode E · Tasks</div>

              <div className="mt-4 space-y-4">
                <TaskGroup title="Overdue" items={tasks.overdue} color="text-red-400" />
                <TaskGroup title="Today" items={tasks.today} color="text-white" />
                <TaskGroup title="Upcoming" items={tasks.upcoming} color="text-slate-400" />
                <TaskGroup title="Completed" items={tasks.completed} color="text-slate-500" />
              </div>
            </div>
          </div>

          {/* Stocks */}
          <div className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-4">
            <div className="grid grid-cols-6 gap-4">
              {stocks.map((s) => (
                <div key={s.symbol} className="bg-white/5 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <div>{s.symbol}</div>
                    <div className={s.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>{s.change}</div>
                  </div>
                  <div>{s.price}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


