import { signOut } from "@/lib/actions/auth";
import MobileNav from "@/components/MobileNav";

export default function TopBar({ displayName }: { displayName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-line bg-surface/80 backdrop-blur px-4 lg:px-8 py-4 sticky top-0 z-10">
      <MobileNav />
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">
          嗨，<span className="text-ink font-medium">{displayName}</span>
        </span>
        <form action={signOut}>
          <button type="submit" className="btn-secondary text-xs px-3 py-1.5">
            登出
          </button>
        </form>
      </div>
    </header>
  );
}
