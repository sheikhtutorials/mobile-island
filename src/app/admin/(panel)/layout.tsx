import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div className="card max-w-sm p-6">
          <h1 className="text-lg font-bold">Not authorized</h1>
          <p className="mt-2 text-sm text-zinc-400">
            <b>{user.email}</b> is signed in but isn&apos;t listed in the <code>admins</code> table.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  const settings = await getSettings();
  return (
    <div className="lg:flex">
      <AdminNav email={user.email || ""} siteName={settings?.site_name || "Store"} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
