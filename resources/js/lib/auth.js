import { usePage } from "@inertiajs/react";

export function useAuth() {
    return usePage().props.auth ?? { user: null };
}

export function useRoles() {
    return usePage().props.auth?.user?.roles ?? [];
}

export function useIsAdmin() {
    return useRoles().includes("Admin");
}

export function useCan() {
    const permissions = usePage().props.auth?.user?.permissions ?? [];

    return (permission) => !permission || permissions.includes(permission);
}
