"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/products", label: "商品" },
  { href: "/cart", label: "購物車", cart: true },
];

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </span>
  );
}

function NavLink({
  href,
  label,
  cart,
  itemCount,
  onClick,
}: {
  href: string;
  label: string;
  cart?: boolean;
  itemCount?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative inline-flex items-center gap-1.5 py-1 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
    >
      {cart ? <CartIcon count={itemCount ?? 0} /> : null}
      <span>
        {label}
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-indigo-600 transition-all duration-200 group-hover:w-full" />
      </span>
    </Link>
  );
}

export default function Header() {
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const displayName = session?.user?.name || session?.user?.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";
  const cartCount = isLoggedIn ? cart.itemCount : 0;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900 transition-colors duration-200 hover:text-indigo-600"
        >
          NookShop
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              cart={link.cart}
              itemCount={cartCount}
            />
          ))}
          {status === "loading" ? null : isLoggedIn ? (
            <>
              {session.user.role === "admin" ? (
                <NavLink href="/admin" label="主控台" />
              ) : null}
              <NavLink href="/orders" label="我的訂單" />
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
                  title={displayName}
                >
                  {avatarLetter}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
                >
                  登出
                </button>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-secondary h-9 px-4 text-sm">
              登入
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/cart"
            className="relative text-slate-700"
            aria-label="購物車"
          >
            <CartIcon count={cartCount} />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-slate-700 transition-colors duration-200 hover:bg-gray-50"
            aria-label={menuOpen ? "關閉選單" : "開啟選單"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                cart={link.cart}
                itemCount={cartCount}
                onClick={closeMenu}
              />
            ))}
            {status === "loading" ? null : isLoggedIn ? (
              <>
                {session.user.role === "admin" ? (
                  <NavLink href="/admin" label="主控台" onClick={closeMenu} />
                ) : null}
                <NavLink href="/orders" label="我的訂單" onClick={closeMenu} />
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {avatarLetter}
                  </span>
                  <span className="flex-1 truncate text-sm text-slate-700">
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void signOut({ callbackUrl: "/" });
                    }}
                    className="text-sm font-medium text-slate-600"
                  >
                    登出
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="btn-secondary w-full"
              >
                登入
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
