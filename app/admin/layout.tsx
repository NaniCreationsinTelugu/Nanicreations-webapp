import AdminSidebar from "./AdminSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // TODO: Add admin role check here
    // if (user.publicMetadata.role !== 'admin') {
    //   redirect("/");
    // }

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto bg-muted/10 p-8">
                {children}
            </main>
        </div>
    );
}
