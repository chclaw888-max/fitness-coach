import { signIn, signUp } from "@/lib/actions/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { mode?: string; error?: string; message?: string };
}) {
  const isSignup = searchParams.mode === "signup";

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* 左側：品牌區塊 */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">
              Coaching System
            </span>
          </div>
          <h1 className="mt-10 font-display text-4xl leading-tight">
            訓練，
            <br />
            從紀錄開始。
          </h1>
          <p className="mt-4 max-w-sm text-paper/70 text-sm leading-relaxed">
            設定年度、月度、週目標，安排每日訓練內容，追蹤體重、體脂與肌肉量變化——
            所有數據集中在一個儀表板上。
          </p>
        </div>
        <div className="space-y-3 font-mono text-xs text-paper/50">
          <div className="flex justify-between border-t border-paper/10 pt-3">
            <span>01</span>
            <span>年 / 月 / 週目標追蹤</span>
          </div>
          <div className="flex justify-between border-t border-paper/10 pt-3">
            <span>02</span>
            <span>訓練行事曆紀錄</span>
          </div>
          <div className="flex justify-between border-t border-paper/10 pt-3">
            <span>03</span>
            <span>身體指標視覺化</span>
          </div>
        </div>
      </div>

      {/* 右側：表單區塊 */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <span className="h-2 w-2 rounded-full bg-accent inline-block mr-2" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Coaching System
            </span>
          </div>

          <h2 className="font-display text-2xl mb-1">
            {isSignup ? "建立帳號" : "登入"}
          </h2>
          <p className="text-sm text-muted mb-6">
            {isSignup ? "建立你的訓練追蹤帳號" : "使用 Email 與密碼登入你的訓練紀錄"}
          </p>

          {searchParams.error && (
            <div className="mb-4 rounded border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
              {decodeURIComponent(searchParams.error)}
            </div>
          )}
          {searchParams.message && (
            <div className="mb-4 rounded border border-good/30 bg-good/10 px-3 py-2 text-sm text-good">
              {decodeURIComponent(searchParams.message)}
            </div>
          )}

          {isSignup ? (
            <form action={signUp} className="space-y-4">
              <div>
                <label className="label" htmlFor="displayName">暱稱</label>
                <input className="input" id="displayName" name="displayName" placeholder="你的名字" required />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="label" htmlFor="password">密碼</label>
                <input className="input" id="password" name="password" type="password" placeholder="至少 6 碼" minLength={6} required />
              </div>
              <button type="submit" className="btn-primary w-full">建立帳號</button>
              <p className="text-center text-sm text-muted">
                已經有帳號了？{" "}
                <a href="/login" className="text-accent-dark font-medium hover:underline">
                  返回登入
                </a>
              </p>
            </form>
          ) : (
            <form action={signIn} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="label" htmlFor="password">密碼</label>
                <input className="input" id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-primary w-full">登入</button>
              <p className="text-center text-sm text-muted">
                還沒有帳號？{" "}
                <a href="/login?mode=signup" className="text-accent-dark font-medium hover:underline">
                  建立帳號
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
