'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, Video } from 'lucide-react';
import Link from 'next/link';
import CourseDialog from './CourseDialog';

interface Course {
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

interface CourseManagementProps {
    initialCourses: Course[];
}

export default function CourseManagement({ initialCourses }: CourseManagementProps) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const handleAdd = () => {
        setEditingCourse(null);
        setDialogOpen(true);
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this course? This will also delete all associated videos.')) return;

        try {
            const response = await fetch(`/api/admin/courses?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCourses(courses.filter(c => c.id !== id));
            } else {
                alert('Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course');
        }
    };

    const handleSuccess = async () => {
        // Refetch courses to get updated data
        try {
            const response = await fetch('/api/courses');
            if (response.ok) {
                const updatedCourses = await response.json();
                setCourses(updatedCourses);
            }
        } catch (error) {
            console.error('Error refreshing courses:', error);
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Courses</h1>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                    <Card key={c.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{c.name}</span>
                                <div className="flex gap-2">
                                    {c.isFree && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Free
                                        </span>
                                    )}
                                    {c.isPublished && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            Published
                                        </span>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {c.description || 'No description'}
                            </p>
                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="font-medium">₹{c.price}</span>
                                <span className="text-muted-foreground">{c.videoCount} videos</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/courses/${c.id}/videos`}>
                                        <Video className="mr-2 h-4 w-4" />
                                        Videos
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(c)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(c.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No courses found. Create one to get started.</p>
                    </CardContent>
                </Card>
            )}

            <CourseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                course={editingCourse}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
