"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProps } from "@repo/ui";
import { removeCookieValue } from "@repo/lib";
import ThemeToggle from "../../Theme/ui/ThemeToggle";
import Logout from "../../../svg/Logout";

export default function Sidebar({ navItems, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeCookieValue("access_token");
    onClose();
    router.replace("/signin");
    router.refresh();
  };

  // 경로가 겹치는 항목(예: /inquiry, /inquiry/admin)이 동시에 활성화되지 않도록
  // 현재 경로에 매칭되는 항목 중 가장 구체적인(긴) 경로 하나만 활성으로 고른다.
  const activePath = navItems
    .map(({ path }) => path)
    .filter((path) =>
      path === "/"
        ? pathname === "/"
        : pathname === path || pathname.startsWith(`${path}/`),
    )
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav
      className={`fixed top-0 left-0 z-[100] flex h-screen w-[220px] flex-col border-r border-gray-200 bg-white px-4 py-6
        transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <button
        className="mb-6 flex items-center px-2 transition hover:opacity-80 cursor-pointer"
        onClick={() => {
          router.push("/");
          onClose();
        }}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={56}
          height={37}
          loading="eager"
          style={{ width: 56, height: 37 }}
        />
      </button>

      {navItems.map(({ label, path }) => {
        const isActive = path === activePath;

        return (
          <div key={path} className="border-b border-gray-100">
            <button
              onClick={() => {
                router.push(path);
                onClose();
              }}
              className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-[16px] font-medium outline-none transition-colors duration-200 ${
                isActive
                  ? "bg-yellow-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800"
              }`}
            >
              {label}
            </button>
          </div>
        );
      })}

      <div className="mt-auto flex flex-col gap-2 pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-gray-100 text-[13px] font-medium text-gray-600 outline-none transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 md:hidden"
        >
          <Logout className="h-[13px] w-[16px]" aria-hidden="true" />
          로그아웃
        </button>

        <ThemeToggle />
      </div>
    </nav>
  );
}
