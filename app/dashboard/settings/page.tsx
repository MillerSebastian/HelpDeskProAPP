"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Upload, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState("");

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPhotoURL(user.photoURL || "");
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await updateProfile(user, {
                displayName,
                photoURL: photoURL || user.photoURL,
            });
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await updatePassword(user, password);
            toast({
                title: "Success",
                description: "Password updated successfully",
            });
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update password. You may need to re-login.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setPhotoURL(data.secure_url);
            toast({
                title: "Success",
                description: "Image uploaded successfully. Click Save Changes to apply.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4">
                    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Profile Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                            {photoURL ? (
                                                <Image
                                                    src={photoURL}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                    <UserIcon className="h-12 w-12" />
                                                </div>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="picture" className="cursor-pointer">
                                                <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                    <Upload className="h-4 w-4" />
                                                    Change Profile Photo
                                                </div>
                                                <Input
                                                    id="picture"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                />
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                JPG, GIF or PNG. Max size of 800K
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Display Name</Label>
                                        <Input
                                            id="displayName"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your Name"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={loading || uploading}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={loading || !password}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
