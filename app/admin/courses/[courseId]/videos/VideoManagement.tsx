'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import VideoDialog from './VideoDialog';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Video {
    id: number;
    title: string;
    youtubeUrl: string;
    duration: string | null;
    description: string | null;
    order: number;
    courseId: number;
}

interface VideoManagementProps {
    courseId: number;
    initialVideos: Video[];
}

function SortableVideoItem({ video, onEdit, onDelete }: { video: Video; onEdit: (video: Video) => void; onDelete: (id: number) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: video.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <button
                        className="mt-1 cursor-grab active:cursor-grabbing touch-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-muted-foreground">#{video.order}</span>
                            <h3 className="font-semibold">{video.title}</h3>
                            {video.duration && (
                                <span className="text-sm text-muted-foreground">({video.duration})</span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{video.youtubeUrl}</p>
                        {video.description && (
                            <p className="text-sm text-muted-foreground">{video.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(video)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(video.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function VideoManagement({ courseId, initialVideos }: VideoManagementProps) {
    const [videos, setVideos] = useState<Video[]>(initialVideos);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = videos.findIndex((v) => v.id === active.id);
            const newIndex = videos.findIndex((v) => v.id === over.id);

            const newVideos = arrayMove(videos, oldIndex, newIndex);

            // Update order numbers
            const updatedVideos = newVideos.map((video, index) => ({
                ...video,
                order: index + 1,
            }));

            setVideos(updatedVideos);

            // Save new order to backend
            try {
                await Promise.all(
                    updatedVideos.map((video) =>
                        fetch(`/api/admin/courses/${courseId}/videos`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: video.id,
                                title: video.title,
                                youtubeUrl: video.youtubeUrl,
                                duration: video.duration,
                                description: video.description,
                                order: video.order,
                            }),
                        })
                    )
                );
            } catch (error) {
                console.error('Error updating video order:', error);
                alert('Failed to update video order');
                // Revert on error
                setVideos(videos);
            }
        }
    };

    const handleEdit = (video: Video) => {
        setEditingVideo(video);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingVideo(null);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/videos?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const newVideos = videos.filter(v => v.id !== id);
                // Reorder remaining videos
                const reorderedVideos = newVideos.map((video, index) => ({
                    ...video,
                    order: index + 1,
                }));
                setVideos(reorderedVideos);
            } else {
                alert('Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    };

    const handleSuccess = async () => {
        // Refetch videos to get updated data
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/videos`);
            if (response.ok) {
                const updatedVideos = await response.json();
                setVideos(updatedVideos);
            }
        } catch (error) {
            console.error('Error refreshing videos:', error);
            // Fallback: just close dialog and keep current state
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">{videos.length} Videos</h2>
                    <p className="text-sm text-muted-foreground">Drag to reorder videos</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                </Button>
            </div>

            {videos.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No videos added yet. Click "Add Video" to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={videos.map(v => v.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {videos.map((video) => (
                                <SortableVideoItem
                                    key={video.id}
                                    video={video}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <VideoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                video={editingVideo}
                courseId={courseId}
                nextOrder={videos.length + 1}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
