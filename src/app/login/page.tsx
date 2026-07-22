"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.8 14.5 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.1-1.5H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.4l3 2.2C7.7 7.3 9.7 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.8 14.5 2.8 12 2.8 8.3 2.8 5.1 4.9 3.9 7.4z"
      />
      <path
        fill="#4A90E2"
        d="M12 21.2c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.9 1-3.1 1-2.4 0-4.4-1.6-5.1-3.8l-3 2.3c1.3 2.6 4 4.9 8.1 4.9z"
      />
      <path
        fill="#FBBC05"
        d="M6.9 13.9c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7l-3-2.3C3.3 9.5 2.8 10.7 2.8 12s.5 2.5 1.1 3.6l3-1.7z"
      />
    </svg>
  );
}

const MESSAGE_MAP: Record<string, string> = {
  email_exists: "此 Email 已註冊，請直接登入",
  google_exists: "此 Email 已透過 Google 註冊，請使用 Google 登入",
  account_exists: "此帳號已註冊，請直接登入",
};

async function startGoogleLogin() {
  await fetch("/api/auth/oauth-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent: "login" }),
  });
  return signIn("google", { callbackUrl: "/" });
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [askGoogle, setAskGoogle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const messageKey = searchParams.get("message");
    const emailParam = searchParams.get("email");

    if (messageKey && MESSAGE_MAP[messageKey]) {
      setNotice(MESSAGE_MAP[messageKey]);
    } else if (searchParams.get("error") === "OAuthAccountNotLinked") {
      setNotice("此 Email 已有帳號，請使用原本的登入方式");
    }

    if (searchParams.get("askGoogle") === "1") {
      setAskGoogle(true);
      setNotice("此 Google 帳號已註冊過，是否改用 Google 登入？");
    }

    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function handleGoogleClick() {
    setGoogleLoading(true);
    try {
      await startGoogleLogin();
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setAskGoogle(false);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email 或密碼錯誤");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-[400px] rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            NookShop
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">登入</h1>
          <p className="mt-1 text-sm text-slate-500">歡迎回來</p>
        </div>

        {notice ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
            <p>{notice}</p>
            {askGoogle ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleClick}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
                >
                  {googleLoading ? "導向中..." : "使用 Google 登入"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAskGoogle(false);
                    setNotice("此 Google 帳號已註冊，請選擇下方方式登入");
                    router.replace("/login?message=google_exists");
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
                >
                  稍後再說
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleClick}
          className="btn-secondary flex w-full items-center justify-center gap-2"
        >
          <GoogleIcon />
          {googleLoading ? "導向中..." : "使用 Google 登入"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-slate-500">或使用帳號密碼</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            密碼
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          還沒有帳號？{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
          >
            註冊
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16 text-sm text-slate-500">
          載入中...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
