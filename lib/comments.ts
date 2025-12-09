import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    doc,
    getDoc,
} from "firebase/firestore";

export interface Comment {
    id?: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    authorRole: "client" | "agent";
    authorPhotoURL?: string;
    message: string;
    createdAt: Timestamp;
}

export const createComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "comments"), {
            ...commentData,
            createdAt: serverTimestamp(),
        });

        // Send email notification
        const ticketDoc = await getDoc(doc(db, "tickets", commentData.ticketId));
        if (ticketDoc.exists()) {
            const ticket = ticketDoc.data();
            let recipientId = "";
            let emailSubject = "";
            let emailText = "";

            if (commentData.authorRole === "agent") {
                // Notify client
                recipientId = ticket.createdBy;
                emailSubject = `New Message on Ticket: ${ticket.title}`;
                emailText = `Agent ${commentData.authorName} replied to your ticket "${ticket.title}":\n\n"${commentData.message}"`;
            } else if (commentData.authorRole === "client" && ticket.assignedTo) {
                // Notify agent
                recipientId = ticket.assignedTo;
                emailSubject = `New Message on Ticket: ${ticket.title}`;
                emailText = `Client ${commentData.authorName} replied to ticket "${ticket.title}":\n\n"${commentData.message}"`;
            }

            if (recipientId) {
                const userDoc = await getDoc(doc(db, "users", recipientId));
                if (userDoc.exists() && userDoc.data().email) {
                    await fetch("/api/send-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: userDoc.data().email,
                            subject: emailSubject,
                            text: emailText,
                        }),
                    });
                }
            }
        }

        return docRef.id;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

export const getCommentsByTicket = async (ticketId: string) => {
    try {
        const q = query(
            collection(db, "comments"),
            where("ticketId", "==", ticketId),
            orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
    } catch (error) {
        console.error("Error getting comments:", error);
        throw error;
    }
};
