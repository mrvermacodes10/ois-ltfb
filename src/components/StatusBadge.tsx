import { STATUS_LABELS } from "@/lib/enums";

export default function StatusBadge({ status }: { status: string }) {
  if (status === "LIVE") return <span className="badge-live"><span className="dot" />LIVE</span>;
  const cls = status === "COMPLETED" ? "bg-green-lunch/15 text-green-lunch" : "bg-chalk/10 text-chalk/60";
  return <span className={`badge-status ${cls}`}>{(STATUS_LABELS[status] ?? status).toUpperCase()}</span>;
}
