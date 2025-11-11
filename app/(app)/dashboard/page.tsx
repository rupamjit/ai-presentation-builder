"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  // Use shared session hook so all components share the same session cache
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Move redirect to client-only effect to avoid render-phase navigation
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);
  const user = session?.user;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 w-px bg-border hidden md:block" />
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome back, {user?.name}! Here&apos;s your presentation overview.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Button asChild className="w-full md:w-auto">
            <Link href="/create/ai">
              <Plus className="mr-2 h-4 w-4" />
              Create Presentation
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* dashboard cards here */}
      </div>
    </div>
  );
}
