"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: normalizedEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "EMAIL_EXISTS") {
          const params = new URLSearchParams({
            message: data.error?.includes("Google")
              ? "google_exists"
              : "email_exists",
            email: normalizedEmail,
          });
          router.push(`/login?${params.toString()}`);
          return;
        }
        setError(data.error || "註冊失敗");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("註冊成功，但自動登入失敗，請手動登入");
        setLoading(false);
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("註冊時發生錯誤，請稍後再試");
      setLoading(false);
    }
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
          <h1 className="mt-4 text-xl font-semibold text-slate-900">註冊</h1>
          <p className="mt-1 text-sm text-slate-500">建立你的帳號</p>
        </div>

        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/oauth-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ intent: "register" }),
            });
            signIn("google", { callbackUrl: "/" });
          }}
          className="btn-secondary flex w-full items-center justify-center gap-2"
        >
          <GoogleIcon />
          使用 Google 註冊
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-slate-500">或使用帳號密碼</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            名稱
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="你的名字"
            />
          </label>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="至少 6 個字元"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "註冊中..." : "註冊"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          已有帳號？{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
          >
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
