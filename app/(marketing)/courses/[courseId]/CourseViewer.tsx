'use client';

import { useState, useEffect } from 'react';
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
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    videoCount: number;
    isPublished: boolean;
    isFree: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface CourseViewerProps {
    courseData: CourseData;
    videos: Video[];
    showSuccess: boolean;
}

export default function CourseViewer({ courseData, videos, showSuccess }: CourseViewerProps) {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [completedVideos, setCompletedVideos] = useState<Set<number>>(new Set());

    // Load completed videos from localStorage on mount
    useEffect(() => {
        const storageKey = `course-${courseData.id}-completed`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setCompletedVideos(new Set(parsed));
            } catch (error) {
                console.error('Error loading completed videos:', error);
            }
        }
    }, [courseData.id]);

    // Save completed videos to localStorage
    const handleMarkComplete = (videoId: number) => {
        setCompletedVideos((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(videoId)) {
                newSet.delete(videoId);
            } else {
                newSet.add(videoId);
            }

            // Save to localStorage
            const storageKey = `course-${courseData.id}-completed`;
            localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));

            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {showSuccess && (
                    <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                        <p className="text-green-800 dark:text-green-200 font-medium">
                            🎉 {courseData.isFree ? 'Welcome to' : 'Enrollment successful! Welcome to'} {courseData.name}
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{courseData.name}</h1>
                    <p className="text-muted-foreground">{courseData.description || 'No description available'}</p>
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
                                completedVideos={completedVideos}
                                onMarkComplete={handleMarkComplete}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <VideoPlaylist
                                videos={videos}
                                courseName={courseData.name}
                                currentVideoIndex={currentVideoIndex}
                                onVideoChange={setCurrentVideoIndex}
                                completedVideos={completedVideos}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
