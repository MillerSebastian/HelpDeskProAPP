"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { User } from "lucide-react";

interface UserAvatarProps {
    userId: string;
    src?: string;
    alt: string;
    className?: string;
}

export function UserAvatar({ userId, src, alt, className = "" }: UserAvatarProps) {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const statusRef = ref(rtdb, "/status/" + userId);
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            setIsOnline(data?.state === "online");
        });

        return () => unsubscribe();
    }, [userId]);

    return (
        <div className={`relative h-10 w-10 ${className}`}>
            <div className="h-full w-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-200">
                {src ? (
                    <img src={src} alt={alt} className="h-full w-full object-cover" />
                ) : (
                    <User className="h-5 w-5 text-gray-500" />
                )}
            </div>
            <span
                className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white transform translate-x-1/4 translate-y-1/4 ${isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
            />
        </div>
    );
}
