'use client';

import { Card } from '@/components/ui/card';

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

export default function VideoPlayer({ videos, currentVideoIndex, onVideoChange }: VideoPlayerProps) {
    if (videos.length === 0) {
        return null;
    }

    const currentVideo = videos[currentVideoIndex];
    const videoId = getYouTubeVideoId(currentVideo.youtubeUrl);

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
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

            <div className="flex gap-2">
                <button
                    onClick={() => onVideoChange(Math.max(0, currentVideoIndex - 1))}
                    disabled={currentVideoIndex === 0}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    ← Previous
                </button>
                <button
                    onClick={() => onVideoChange(Math.min(videos.length - 1, currentVideoIndex + 1))}
                    disabled={currentVideoIndex === videos.length - 1}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
