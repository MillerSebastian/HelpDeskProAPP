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
} from "firebase/firestore";

export interface Comment {
    id?: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    authorRole: "client" | "agent";
    message: string;
    createdAt: Timestamp;
}

export const createComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "comments"), {
            ...commentData,
            createdAt: serverTimestamp(),
        });
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
