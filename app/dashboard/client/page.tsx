"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { getTicketsByUser, Ticket as TicketType } from "@/lib/tickets";
import { Plus, Ticket, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
    switch (status) {
        case "open": return "bg-red-100 text-red-800";
        case "in_progress": return "bg-amber-100 text-amber-800";
        case "resolved": return "bg-emerald-100 text-emerald-800";
        case "closed": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function ClientDashboard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            if (user) {
                try {
                    const userTickets = await getTicketsByUser(user.uid);
                    setTickets(userTickets);
                } catch (error) {
                    console.error("Error fetching tickets:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTickets();
    }, [user]);

    const activeTicketsCount = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
    const resolvedTicketsCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

    return (
        <ProtectedRoute allowedRoles={["client"]}>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Welcome, {user?.displayName}</span>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
                                    <Ticket className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{activeTicketsCount}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Tickets currently being processed
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Resolved/Closed</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{resolvedTicketsCount}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Total resolved or closed tickets
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Need Help?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" asChild>
                                        <Link href="/dashboard/client/create-ticket">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New Ticket
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Tickets Section */}
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>My Recent Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-40">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                        </div>
                                    ) : tickets.length > 0 ? (
                                        <div className="space-y-4">
                                            {tickets.map((ticket) => (
                                                <Link href={`/dashboard/client/tickets/${ticket.id}`} key={ticket.id}>
                                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-gray-100 rounded-full">
                                                                <Clock className="h-4 w-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    ID: {ticket.id} • {ticket.createdAt ? format(ticket.createdAt.toDate(), "MMM d, yyyy") : "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                                                {ticket.status}
                                                            </Badge>
                                                            <Badge variant="secondary">
                                                                {ticket.priority}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            No tickets found. Create one to get started!
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
