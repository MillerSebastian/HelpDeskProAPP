"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Welcome to HelpDeskPro</CardTitle>
                    <CardDescription className="text-center">
                        Please sign in or create an account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button asChild className="w-full" size="lg">
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" size="lg">
                        <Link href="/auth/register">Create Account</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
