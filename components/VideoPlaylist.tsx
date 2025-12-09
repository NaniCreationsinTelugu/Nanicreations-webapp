'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { PlayCircle, CheckCircle } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    youtubeUrl: string;
    duration: string | null;
    description: string | null;
    order: number;
}

interface VideoPlaylistProps {
    videos: Video[];
    courseName: string;
    currentVideoIndex: number;
    onVideoChange: (index: number) => void;
    completedVideos: Set<number>;
}

export default function VideoPlaylist({ videos, courseName, currentVideoIndex, onVideoChange, completedVideos }: VideoPlaylistProps) {
    const handleVideoClick = (index: number) => {
        onVideoChange(index);
    };

    return (
        <Card className="h-fit max-h-[calc(100vh-200px)] overflow-hidden flex flex-col py-2">
            <CardHeader className="border-b">
                <h3 className="font-bold text-lg">Course Content</h3>
                <p className="text-sm text-muted-foreground">
                    {videos.length} lessons • {completedVideos.size} completed
                </p>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto">
                <div className="divide-y">
                    {videos.map((video, index) => {
                        const isActive = index === currentVideoIndex;
                        const isCompleted = completedVideos.has(video.id);

                        return (
                            <div
                                key={video.id}
                                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${isActive ? 'bg-primary/10 border-l-4 border-primary' : ''
                                    }`}
                                onClick={() => handleVideoClick(index)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {isCompleted ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <PlayCircle className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`font-medium text-sm ${isActive ? 'text-primary' : ''}`}>
                                                {index + 1}. {video.title}
                                            </h4>
                                            {video.duration && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {video.duration}
                                                </span>
                                            )}
                                        </div>
                                        {video.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
