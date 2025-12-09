import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

export interface Ticket {
    id?: string;
    title: string;
    description: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high";
    createdBy: string; // User UID
    createdByName: string;
    assignedTo?: string; // Agent UID
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const createTicket = async (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status">) => {
    try {
        const docRef = await addDoc(collection(db, "tickets"), {
            ...ticketData,
            status: "open",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
    }
};

export const getTicketsByUser = async (userId: string) => {
    try {
        const q = query(
            collection(db, "tickets"),
            where("createdBy", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Ticket));
    } catch (error) {
        console.error("Error getting user tickets:", error);
        throw error;
    }
};

export const getAllTickets = async () => {
    try {
        const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Ticket));
    } catch (error) {
        console.error("Error getting all tickets:", error);
        throw error;
    }
};

export const getTicketById = async (ticketId: string) => {
    try {
        const docRef = doc(db, "tickets", ticketId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Ticket;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting ticket:", error);
        throw error;
    }
};

export const updateTicketStatus = async (ticketId: string, status: Ticket["status"]) => {
    try {
        const docRef = doc(db, "tickets", ticketId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating ticket status:", error);
        throw error;
    }
};

export const updateTicketPriority = async (ticketId: string, priority: Ticket["priority"]) => {
    try {
        const docRef = doc(db, "tickets", ticketId);
        await updateDoc(docRef, {
            priority,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating ticket priority:", error);
        throw error;
    }
};

export const assignTicket = async (ticketId: string, agentId: string) => {
    try {
        const docRef = doc(db, "tickets", ticketId);
        await updateDoc(docRef, {
            assignedTo: agentId,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error assigning ticket:", error);
        throw error;
    }
};
