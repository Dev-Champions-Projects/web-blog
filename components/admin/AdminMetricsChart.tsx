interface DailyRow {
  date: string;
  views: number;
  claps: number;
  comments: number;
  bookmarks: number;
  newUsers: number;
}

interface TopPost {
  id: string;
  title: string;
  views: number;
  _count?: { claps: number };
}

interface Props {
  daily: DailyRow[];
  topPosts: TopPost[];
}

const MetricSmall = ({
  label,
  values,
}: {
  label: string;
  values: { date: string; count: number }[];
}) => {
  const max = Math.max(...values.map((v) => v.count), 1);

  return (
    <div className="rounded-[1rem] border p-4 bg-white/80 dark:bg-slate-900/80">
      <p className="text-sm text-slate-500 mb-3">{label}</p>
      <div className="space-y-2">
        {values.slice(-14).map((v) => (
          <div
            key={v.date}
            className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300"
          >
            <span className="truncate mr-2" style={{ maxWidth: 120 }}>
              {v.date}
            </span>
            <div className="flex-1 ml-2 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(v.count / max) * 100}%` }}
              />
            </div>
            <span className="ml-3 w-10 text-right font-semibold">
              {v.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminMetricsChart = ({ daily, topPosts }: Props) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricSmall
          label="Views (last 14 days)"
          values={daily.map((d) => ({ date: d.date, count: d.views }))}
        />
        <MetricSmall
          label="Claps (last 14 days)"
          values={daily.map((d) => ({ date: d.date, count: d.claps }))}
        />
        <MetricSmall
          label="Comments (last 14 days)"
          values={daily.map((d) => ({ date: d.date, count: d.comments }))}
        />
        <MetricSmall
          label="Bookmarks (last 14 days)"
          values={daily.map((d) => ({ date: d.date, count: d.bookmarks }))}
        />
      </div>

      <div className="rounded-[2rem] border p-4 bg-white/80 dark:bg-slate-900/80">
        <p className="text-sm text-slate-500 mb-3">Top posts by views</p>
        <div className="space-y-2">
          {topPosts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl bg-white p-3 dark:bg-slate-900"
            >
              <div className="min-w-0 truncate">{p.title}</div>
              <div className="ml-4 text-sm text-slate-600 dark:text-slate-300">
                Views: {p.views} · Claps: {p._count?.claps ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMetricsChart;
