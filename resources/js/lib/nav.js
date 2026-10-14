import {
    BookOpen,
    CheckSquare,
    Grid,
    Layers,
    LayoutGrid,
    ShoppingBag,
    Tag,
    Users,
} from "lucide-react";

export const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
        permission: "view-dashboard",
    },
    {
        label: "Categories",
        href: "/categories",
        icon: Layers,
        permission: "view-categories",
    },
    {
        label: "Inventory",
        href: "/items",
        icon: CheckSquare,
        permission: "view-items",
    },
    {
        label: "Suppliers",
        href: "/suppliers",
        icon: Grid,
        permission: "view-suppliers",
    },
    {
        label: "Purchases",
        href: "/purchases",
        icon: ShoppingBag,
        permission: "view-purchases",
    },
    { label: "Sales", href: "/sales", icon: Tag, permission: "view-sales" },
    {
        label: "Stock Ledger",
        href: "/stock-ledger",
        icon: BookOpen,
        permission: "view-ledger",
    },
    { label: "Users", href: "/admin/users", icon: Users, role: "Admin" },
];
