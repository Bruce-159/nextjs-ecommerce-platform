import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800 bg-gray-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-bold tracking-tight">NookShop</p>
          <p className="mt-1 text-sm text-gray-400">
            &copy; {new Date().getFullYear()} NookShop. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
          <Link
            href="/products"
            className="transition-colors duration-200 hover:text-white"
          >
            商品
          </Link>
          <Link
            href="/orders"
            className="transition-colors duration-200 hover:text-white"
          >
            訂單
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
