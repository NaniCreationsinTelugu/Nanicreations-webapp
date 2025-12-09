"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface Video {
    id: number;
    title: string;
    youtubeUrl: string;
    duration: string | null;
    description: string | null;
    order: number;
}

interface VideoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    video?: Video | null;
    courseId: number;
    nextOrder: number;
    onSuccess: () => void;
}

export default function VideoDialog({
    open,
    onOpenChange,
    video,
    courseId,
    nextOrder,
    onSuccess,
}: VideoDialogProps) {
    const [title, setTitle] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [duration, setDuration] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (video) {
            setTitle(video.title);
            setYoutubeUrl(video.youtubeUrl);
            setDuration(video.duration || "");
            setDescription(video.description || "");
        } else {
            setTitle("");
            setYoutubeUrl("");
            setDuration("");
            setDescription("");
        }
    }, [video, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = video ? "PUT" : "POST";
            const body = video
                ? { id: video.id, title, youtubeUrl, duration, description, order: video.order }
                : { title, youtubeUrl, duration, description, order: nextOrder };

            const response = await fetch(`/api/admin/courses/${courseId}/videos`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save video");
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {video ? "Edit Video" : "Add New Video"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Introduction to React"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                            <Input
                                id="youtubeUrl"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="10:30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the video content"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : video ? "Update" : "Add Video"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
