import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/login">로그인</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:inline" title={user.email ?? undefined}>
        {user.email}
      </span>
      <form action="/auth/signout" method="post">
        <Button type="submit" size="sm" variant="ghost">
          로그아웃
        </Button>
      </form>
    </div>
  );
}
