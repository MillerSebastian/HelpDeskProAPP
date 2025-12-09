import { useEffect } from "react";
import { ref, onValue, onDisconnect, set, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { User } from "firebase/auth";

export const usePresence = (user: User | null) => {
    useEffect(() => {
        if (!user) return;

        const connectedRef = ref(rtdb, ".info/connected");
        const userStatusRef = ref(rtdb, `/status/${user.uid}`);

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === false) {
                return;
            }

            onDisconnect(userStatusRef)
                .set({
                    state: "offline",
                    last_changed: serverTimestamp(),
                })
                .then(() => {
                    set(userStatusRef, {
                        state: "online",
                        last_changed: serverTimestamp(),
                    });
                });
        });

        return () => unsubscribe();
    }, [user]);
};
