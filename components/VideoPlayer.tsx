'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    youtubeUrl: string;
    duration: string | null;
    description: string | null;
    order: number;
}

interface VideoPlayerProps {
    videos: Video[];
    currentVideoIndex: number;
    onVideoChange: (index: number) => void;
    completedVideos: Set<number>;
    onMarkComplete: (videoId: number) => void;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /youtube\.com\/embed\/([^&\s]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export default function VideoPlayer({ videos, currentVideoIndex, onVideoChange, completedVideos, onMarkComplete }: VideoPlayerProps) {
    if (videos.length === 0) {
        return null;
    }

    const currentVideo = videos[currentVideoIndex];
    const videoId = getYouTubeVideoId(currentVideo.youtubeUrl);
    const isCompleted = completedVideos.has(currentVideo.id);

    const handleMarkComplete = () => {
        onMarkComplete(currentVideo.id);
        // Auto-advance to next video if not the last one
        if (currentVideoIndex < videos.length - 1) {
            setTimeout(() => {
                onVideoChange(currentVideoIndex + 1);
            }, 500);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden py-0">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    {videoId ? (
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={currentVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">Invalid video URL</p>
                        </div>
                    )}
                </div>
            </Card>

            <div>
                <h2 className="text-2xl font-bold mb-2">{currentVideo.title}</h2>
                {currentVideo.description && (
                    <p className="text-muted-foreground">{currentVideo.description}</p>
                )}
            </div>

            <div className="flex gap-2 flex-wrap">
                <Button
                    onClick={() => onVideoChange(Math.max(0, currentVideoIndex - 1))}
                    disabled={currentVideoIndex === 0}
                    variant="outline"
                >
                    ← Previous
                </Button>

                <Button
                    onClick={handleMarkComplete}
                    variant={isCompleted ? "secondary" : "default"}
                    className={isCompleted ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                >
                    {isCompleted ? (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Complete
                        </>
                    )}
                </Button>

                <Button
                    onClick={() => onVideoChange(Math.min(videos.length - 1, currentVideoIndex + 1))}
                    disabled={currentVideoIndex === videos.length - 1}
                    variant="outline"
                >
                    Next →
                </Button>
            </div>
        </div>
    );
}
