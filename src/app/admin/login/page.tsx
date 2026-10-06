import Link from "next/link";
import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-black pitch-texture px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block mb-6 text-sm text-chalk/50 hover:text-chalk transition-colors">
          ← Back to LTFB
        </Link>
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">OIS LUNCHTIME FOOTY</h1>
          <p className="text-sm text-green-lunch font-semibold mt-1">Admin control centre</p>
        </div>
        <div className="panel p-6"><LoginForm /></div>
      </div>
    </div>
  );
}
