export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/problems", label: "문제" },
  { href: "/progress", label: "학습 현황" },
  { href: "/settings", label: "설정" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
