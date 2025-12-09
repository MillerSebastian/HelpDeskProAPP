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

        // Notify all agents
        const q = query(collection(db, "users"), where("role", "==", "agent"));
        const querySnapshot = await getDocs(q);

        const emailPromises = querySnapshot.docs.map(doc => {
            const agent = doc.data();
            if (agent.email) {
                return fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: agent.email,
                        subject: `New Ticket: ${ticketData.title}`,
                        text: `A new ticket has been created by ${ticketData.createdByName}.\n\nTitle: ${ticketData.title}\nDescription: ${ticketData.description}\n\nView it on the dashboard.`,
                    }),
                });
            }
        });

        await Promise.all(emailPromises);

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

export const getTicketsByAssignee = async (agentId: string) => {
    try {
        const q = query(
            collection(db, "tickets"),
            where("assignedTo", "==", agentId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Ticket));
    } catch (error) {
        console.error("Error getting assigned tickets:", error);
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

        // Notify client
        const ticketSnap = await getDoc(docRef);
        if (ticketSnap.exists()) {
            const ticket = ticketSnap.data() as Ticket;
            const clientDoc = await getDoc(doc(db, "users", ticket.createdBy));
            const agentDoc = await getDoc(doc(db, "users", agentId));

            if (clientDoc.exists() && clientDoc.data().email && agentDoc.exists()) {
                const agentName = agentDoc.data().name || "An agent";
                await fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: clientDoc.data().email,
                        subject: `Ticket Assigned: ${ticket.title}`,
                        text: `Your ticket "${ticket.title}" has been assigned to ${agentName}.`,
                    }),
                });
            }
        }
    } catch (error) {
        console.error("Error assigning ticket:", error);
        throw error;
    }
};
