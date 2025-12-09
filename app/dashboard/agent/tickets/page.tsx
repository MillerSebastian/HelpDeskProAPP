"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { getTicketsByAssignee, Ticket } from "@/lib/tickets";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input } from "@/components/ui/input";

const getStatusColor = (status: string) => {
    switch (status) {
        case "open": return "bg-red-100 text-red-800";
        case "in_progress": return "bg-amber-100 text-amber-800";
        case "resolved": return "bg-emerald-100 text-emerald-800";
        case "closed": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "high": return "bg-red-100 text-red-800";
        case "medium": return "bg-amber-100 text-amber-800";
        case "low": return "bg-green-100 text-green-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function AgentTicketsPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            if (user) {
                try {
                    const data = await getTicketsByAssignee(user.uid);
                    setTickets(data);
                    setFilteredTickets(data);
                } catch (error) {
                    console.error("Error fetching tickets:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTickets();
    }, [user]);

    useEffect(() => {
        const filtered = tickets.filter(ticket =>
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTickets(filtered);
    }, [searchQuery, tickets]);

    return (
        <ProtectedRoute allowedRoles={["agent"]}>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">My Assigned Tickets</h1>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Assigned to Me</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search tickets..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : filteredTickets.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredTickets.map((ticket) => (
                                            <Link href={`/dashboard/agent/tickets/${ticket.id}`} key={ticket.id}>
                                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                                                            <Badge className={getStatusColor(ticket.status)}>
                                                                {ticket.status}
                                                            </Badge>
                                                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                                                {ticket.priority}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{ticket.description}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Created by {ticket.createdByName} on {ticket.createdAt ? format(ticket.createdAt.toDate(), "PPP") : "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No tickets assigned to you.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
