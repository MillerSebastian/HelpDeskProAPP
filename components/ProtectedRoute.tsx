"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ("client" | "agent")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login");
            } else if (allowedRoles && role && !allowedRoles.includes(role)) {
                // Redirect based on role if trying to access unauthorized page
                if (role === "client") {
                    router.push("/dashboard/client");
                } else if (role === "agent") {
                    router.push("/dashboard/agent");
                }
            }
        }
    }, [user, role, loading, router, allowedRoles]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return null;
    }

    return <>{children}</>;
}
