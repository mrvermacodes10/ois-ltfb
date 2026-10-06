import { prisma } from "@/lib/prisma";

export default async function AdminActivityPage() {
  const activity = await prisma.adminActivity.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Activity log</h1>
      <p className="text-sm text-chalk/50 mb-6">The last 100 admin actions, most recent first.</p>
      <div className="panel divide-y divide-chalk/10">
        {activity.length === 0 && <p className="p-4 text-sm text-chalk/50">No activity recorded yet.</p>}
        {activity.map((a) => (
          <div key={a.id} className="p-3 flex items-center justify-between text-sm">
            <div><span className="font-medium">{a.action}</span>{a.detail && <span className="text-chalk/50"> — {a.detail}</span>}</div>
            <span className="text-xs text-chalk/40">{a.createdAt.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
