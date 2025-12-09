"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import TicketChart from "./TicketChart";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAllTickets, Ticket } from "@/lib/tickets";
import { CheckCircle2, Clock, AlertCircle, Loader2, Filter } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const getStatusIcon = (status: string) => {
    switch (status) {
        case "open": return <AlertCircle className="h-4 w-4 text-red-500" />;
        case "in_progress": return <Clock className="h-4 w-4 text-amber-500" />;
        case "resolved": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        case "closed": return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
        default: return null;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "open": return "bg-red-100 text-red-800";
        case "in_progress": return "bg-amber-100 text-amber-800";
        case "resolved": return "bg-emerald-100 text-emerald-800";
        case "closed": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function AgentDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const allTickets = await getAllTickets();
                setTickets(allTickets);
                setFilteredTickets(allTickets);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    useEffect(() => {
        let result = tickets;
        if (statusFilter !== "all") {
            result = result.filter(t => t.status === statusFilter);
        }
        if (priorityFilter !== "all") {
            result = result.filter(t => t.priority === priorityFilter);
        }
        setFilteredTickets(result);
    }, [tickets, statusFilter, priorityFilter]);

    // Calculate stats
    const openCount = tickets.filter(t => t.status === "open").length;
    const pendingCount = tickets.filter(t => t.status === "in_progress").length;
    const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

    const chartData = [
        { id: 'Open', value: openCount, color: '#ef4444' },
        { id: 'In Progress', value: pendingCount, color: '#f59e0b' },
        { id: 'Resolved/Closed', value: resolvedCount, color: '#10b981' },
    ];

    return (
        <ProtectedRoute allowedRoles={["agent"]}>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Analytics Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analytics Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TicketChart data={chartData} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-blue-600">{tickets.length}</div>
                                        <div className="text-sm text-blue-600">Total Tickets</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-red-600">{openCount}</div>
                                        <div className="text-sm text-red-600">Open Tickets</div>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                                        <div className="text-sm text-amber-600">In Progress</div>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-lg text-center">
                                        <div className="text-3xl font-bold text-emerald-600">{resolvedCount}</div>
                                        <div className="text-sm text-emerald-600">Resolved</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Recent Tickets Section */}
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>All Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-40">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                        </div>
                                    ) : filteredTickets.length > 0 ? (
                                        <div className="space-y-4">
                                            {filteredTickets.map((ticket) => (
                                                <Link href={`/dashboard/agent/tickets/${ticket.id}`} key={ticket.id}>
                                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-gray-100 rounded-full">
                                                                {getStatusIcon(ticket.status)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    ID: {ticket.id} • User: {ticket.createdByName} • {ticket.createdAt ? format(ticket.createdAt.toDate(), "MMM d, yyyy") : "N/A"}
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
                                            No tickets found matching your filters.
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
