'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

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

export default function VideoManagement({ courseId, initialVideos }: VideoManagementProps) {
    const [videos, setVideos] = useState<Video[]>(initialVideos);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        youtubeUrl: '',
        duration: '',
        description: '',
        order: videos.length + 1,
    });

    const resetForm = () => {
        setFormData({
            title: '',
            youtubeUrl: '',
            duration: '',
            description: '',
            order: videos.length + 1,
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAdd = async () => {
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newVideo = await response.json();
                setVideos([...videos, newVideo]);
                resetForm();
            } else {
                alert('Failed to add video');
            }
        } catch (error) {
            console.error('Error adding video:', error);
            alert('Error adding video');
        }
    };

    const handleEdit = (video: Video) => {
        setEditingId(video.id);
        setFormData({
            title: video.title,
            youtubeUrl: video.youtubeUrl,
            duration: video.duration || '',
            description: video.description || '',
            order: video.order,
        });
    };

    const handleUpdate = async () => {
        if (editingId === null) return;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/videos`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, id: editingId }),
            });

            if (response.ok) {
                const updatedVideo = await response.json();
                setVideos(videos.map(v => v.id === editingId ? updatedVideo : v));
                resetForm();
            } else {
                alert('Failed to update video');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            alert('Error updating video');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/videos?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setVideos(videos.filter(v => v.id !== id));
            } else {
                alert('Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{videos.length} Videos</h2>
                {!isAdding && !editingId && (
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Video
                    </Button>
                )}
            </div>

            {(isAdding || editingId !== null) && (
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold">{isAdding ? 'Add New Video' : 'Edit Video'}</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Introduction to React"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">YouTube URL *</label>
                            <input
                                type="text"
                                value={formData.youtubeUrl}
                                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration</label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="10:30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Order *</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                rows={3}
                                placeholder="Brief description of the video content"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={isAdding ? handleAdd : handleUpdate}>
                                <Save className="h-4 w-4 mr-2" />
                                {isAdding ? 'Add Video' : 'Update Video'}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {videos.sort((a, b) => a.order - b.order).map((video) => (
                    <Card key={video.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
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
                                        onClick={() => handleEdit(video)}
                                        disabled={editingId !== null || isAdding}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(video.id)}
                                        disabled={editingId !== null || isAdding}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {videos.length === 0 && !isAdding && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No videos added yet. Click "Add Video" to get started.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
