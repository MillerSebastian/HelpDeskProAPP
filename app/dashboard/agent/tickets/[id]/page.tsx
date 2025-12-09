"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
    getTicketById,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    Ticket
} from "@/lib/tickets";
import { createComment, getCommentsByTicket, Comment } from "@/lib/comments";
import { ArrowLeft, Send, Loader2, User, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const getStatusColor = (status: string) => {
    switch (status) {
        case "open": return "bg-red-100 text-red-800";
        case "in_progress": return "bg-amber-100 text-amber-800";
        case "resolved": return "bg-emerald-100 text-emerald-800";
        case "closed": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function AgentTicketDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (id && typeof id === "string") {
                try {
                    const [ticketData, commentsData] = await Promise.all([
                        getTicketById(id),
                        getCommentsByTicket(id),
                    ]);
                    setTicket(ticketData);
                    setComments(commentsData);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    toast({
                        title: "Error",
                        description: "Failed to load ticket details",
                        variant: "destructive",
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id, toast]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !ticket || !newComment.trim()) return;

        setSubmitting(true);
        try {
            await createComment({
                ticketId: ticket.id!,
                authorId: user.uid,
                authorName: user.displayName || user.email || "Agent",
                authorRole: "agent",
                message: newComment,
            });

            const updatedComments = await getCommentsByTicket(ticket.id!);
            setComments(updatedComments);
            setNewComment("");
            toast({
                title: "Success",
                description: "Response sent successfully",
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            toast({
                title: "Error",
                description: "Failed to send response",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (value: string) => {
        if (!ticket) return;
        setUpdating(true);
        try {
            await updateTicketStatus(ticket.id!, value as Ticket["status"]);
            setTicket({ ...ticket, status: value as Ticket["status"] });
            toast({ title: "Updated", description: "Ticket status updated" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    const handlePriorityChange = async (value: string) => {
        if (!ticket) return;
        setUpdating(true);
        try {
            await updateTicketPriority(ticket.id!, value as Ticket["priority"]);
            setTicket({ ...ticket, priority: value as Ticket["priority"] });
            toast({ title: "Updated", description: "Ticket priority updated" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update priority", variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignSelf = async () => {
        if (!ticket || !user) return;
        setUpdating(true);
        try {
            await assignTicket(ticket.id!, user.uid);
            setTicket({ ...ticket, assignedTo: user.uid });
            toast({ title: "Assigned", description: "Ticket assigned to you" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to assign ticket", variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Ticket Not Found</h1>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/agent">Go Back</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={["agent"]}>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm z-10 p-4 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/agent">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-800">Manage Ticket</h1>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Ticket Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{ticket.title}</CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                ID: {ticket.id} • Created by {ticket.createdByName} on {ticket.createdAt ? format(ticket.createdAt.toDate(), "PPP p") : "N/A"}
                                            </p>
                                        </div>
                                        <Badge className={getStatusColor(ticket.status)}>
                                            {ticket.status.toUpperCase()}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose max-w-none">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Comments Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Conversation</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            {comments.length > 0 ? (
                                                comments.map((comment) => (
                                                    <div
                                                        key={comment.id}
                                                        className={`flex gap-4 ${comment.authorRole === "agent" ? "flex-row-reverse" : ""
                                                            }`}
                                                    >
                                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${comment.authorRole === "agent" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                                            }`}>
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div className={`flex flex-col max-w-[80%] ${comment.authorRole === "agent" ? "items-end" : "items-start"
                                                            }`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {comment.authorName} {comment.authorRole === "agent" && "(Agent)"}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {comment.createdAt ? format(comment.createdAt.toDate(), "MMM d, p") : ""}
                                                                </span>
                                                            </div>
                                                            <div className={`p-3 rounded-lg text-sm ${comment.authorRole === "agent"
                                                                    ? "bg-blue-600 text-white rounded-tr-none"
                                                                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                                                                }`}>
                                                                {comment.message}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    No comments yet.
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Comment Form */}
                                        <div className="pt-4 border-t">
                                            <form onSubmit={handleSubmitComment} className="space-y-4">
                                                <Textarea
                                                    placeholder="Type your response here..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    className="min-h-[100px]"
                                                />
                                                <div className="flex justify-end">
                                                    <Button type="submit" disabled={submitting || !newComment.trim()}>
                                                        {submitting ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Send className="mr-2 h-4 w-4" />
                                                        )}
                                                        Send Response
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Info & Actions */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Management</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                                            <Select
                                                value={ticket.status}
                                                onValueChange={handleStatusChange}
                                                disabled={updating}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                                            <Select
                                                value={ticket.priority}
                                                onValueChange={handlePriorityChange}
                                                disabled={updating}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Assignment</label>
                                            {ticket.assignedTo ? (
                                                <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded text-sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Assigned to {ticket.assignedTo === user?.uid ? "You" : "Agent"}
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={handleAssignSelf}
                                                    disabled={updating}
                                                >
                                                    Assign to Me
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
