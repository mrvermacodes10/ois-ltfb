import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-black text-chalk pitch-texture px-4">
      <div className="text-center">
        <div className="scoreboard-digit font-display text-7xl font-extrabold text-green-lunch">404</div>
        <p className="font-display text-xl font-bold mt-3">Offside — this page doesn't exist.</p>
        <p className="text-chalk/50 mt-2">The page you're looking for isn't here, or isn't available right now.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Back to LTFB</Link>
      </div>
    </div>
  );
}
