import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Layers,
    BookOpen,
    Settings,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Collections",
        href: "/admin/collections",
        icon: Layers
    },
    {
        title: "Courses",
        href: "/admin/courses",
        icon: BookOpen
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings
    }
];

export default function AdminSidebar() {
    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl font-bold">Nani Creations</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                        >
                            <link.icon className="h-4 w-4" />
                            {link.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <SignOutButton>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </SignOutButton>
            </div>
        </div>
    );
}
