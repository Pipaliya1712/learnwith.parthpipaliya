import { AdminGuard } from "@/components/auth/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("hooray")
  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-[1450px] px-4 py-8 sm:px-6 lg:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
