"use client";
import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      return result;
    },
  });

  const user = session?.data?.user;
  const isAuthenticated = !!session?.data?.session;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/signin");
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Desktop Skeleton */}
          <div className="hidden md:block w-64 border-r border-border p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-4 md:p-8 space-y-4">
            <Skeleton className="h-10 w-full md:w-64" />
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 md:h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 w-full p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
