"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getTicketById, Ticket } from "@/lib/tickets";
import { createComment, getCommentsByTicket, Comment } from "@/lib/comments";
import { ArrowLeft, Send, Loader2, User, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";
import { ModeToggle } from "@/components/mode-toggle";

const getStatusColor = (status: string) => {
    switch (status) {
        case "open": return "bg-red-100 text-red-800";
        case "in_progress": return "bg-amber-100 text-amber-800";
        case "resolved": return "bg-emerald-100 text-emerald-800";
        case "closed": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function TicketDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
                authorName: user.displayName || user.email || "Unknown User",
                authorRole: "client",
                authorPhotoURL: user.photoURL || undefined,
                message: newComment,
            });

            const updatedComments = await getCommentsByTicket(ticket.id!);
            setComments(updatedComments);
            setNewComment("");
            toast({
                title: "Success",
                description: "Comment added successfully",
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            toast({
                title: "Error",
                description: "Failed to add comment",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
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
                        <Link href="/dashboard/client">Go Back</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={["client"]}>
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-card shadow-sm z-10 p-4 flex items-center justify-between gap-4 border-b">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/dashboard/client">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold text-foreground">Ticket Details</h1>
                        </div>
                        <ModeToggle />
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
                                                ID: {ticket.id} • Created on {ticket.createdAt ? format(ticket.createdAt.toDate(), "PPP p") : "N/A"}
                                            </p>
                                        </div>
                                        <Badge className={getStatusColor(ticket.status)}>
                                            {ticket.status.toUpperCase()}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose max-w-none">
                                            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                                            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
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
                                                        className={`flex gap-4 ${comment.authorRole === "client" ? "flex-row-reverse" : ""
                                                            }`}
                                                    >
                                                        <UserAvatar
                                                            userId={comment.authorId}
                                                            src={comment.authorPhotoURL}
                                                            alt={comment.authorName}
                                                            className="flex-shrink-0"
                                                        />
                                                        <div className={`flex flex-col max-w-[80%] ${comment.authorRole === "client" ? "items-end" : "items-start"
                                                            }`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {comment.authorName}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {comment.createdAt ? format(comment.createdAt.toDate(), "MMM d, p") : ""}
                                                                </span>
                                                            </div>
                                                            <div className={`p-3 rounded-lg text-sm ${comment.authorRole === "client"
                                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                : "bg-gray-100 text-gray-800 rounded-tl-none"
                                                                }`}>
                                                                {comment.message}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    No comments yet. Start the conversation!
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Comment Form */}
                                        <div className="pt-4 border-t">
                                            <form onSubmit={handleSubmitComment} className="space-y-4">
                                                <Textarea
                                                    placeholder="Type your reply here..."
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
                                                        Send Reply
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Ticket Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                                            <div className="mt-1">
                                                <Badge variant="secondary" className="capitalize">
                                                    {ticket.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Assigned To</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {ticket.assignedTo ? "Agent Assigned" : "Unassigned"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Last Updated</label>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                                {ticket.updatedAt ? format(ticket.updatedAt.toDate(), "MMM d, yyyy") : "N/A"}
                                            </div>
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
