'use client';

import { useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoPlaylist from '@/components/VideoPlaylist';

interface Video {
    id: number;
    title: string;
    youtubeUrl: string;
    duration: string | null;
    description: string | null;
    order: number;
    courseId: number;
}

interface CourseData {
    id: number;
    title: string;
    description: string;
    level: string;
    duration: string;
    lessons: number;
    price: string;
    thumbnail: string | null;
}

interface CourseViewerProps {
    courseData: CourseData;
    videos: Video[];
    showSuccess: boolean;
}

export default function CourseViewer({ courseData, videos, showSuccess }: CourseViewerProps) {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {showSuccess && (
                    <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                        <p className="text-green-800 dark:text-green-200 font-medium">
                            🎉 Enrollment successful! Welcome to {courseData.title}
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
                    <p className="text-muted-foreground">{courseData.description}</p>
                </div>

                {videos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
                        <p className="text-muted-foreground text-lg">
                            Course content is being prepared. Videos will be available soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <VideoPlayer
                                videos={videos}
                                currentVideoIndex={currentVideoIndex}
                                onVideoChange={setCurrentVideoIndex}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <VideoPlaylist
                                videos={videos}
                                courseName={courseData.title}
                                currentVideoIndex={currentVideoIndex}
                                onVideoChange={setCurrentVideoIndex}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
