"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/auth";

const NAV = [
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="w-56 flex flex-col bg-stone-900 text-stone-300 shrink-0">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0">
          <span className="text-stone-900 text-xs font-bold">D</span>
        </div>
        <span className="font-semibold text-white text-sm">DataMind</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-stone-700 text-white"
                  : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
              }`}
            >
              <span className={active ? "text-white" : "text-stone-500"}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-stone-800 mt-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-stone-300">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-200 truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
