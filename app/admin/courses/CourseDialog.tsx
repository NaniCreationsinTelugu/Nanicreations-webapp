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
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/admin/ImageUpload";
import { useState, useEffect } from "react";

interface Course {
    id: number;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    isPublished: boolean;
    isFree: boolean;
}

interface CourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course?: Course | null;
    onSuccess: () => void;
}

export default function CourseDialog({
    open,
    onOpenChange,
    course,
    onSuccess,
}: CourseDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [isFree, setIsFree] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setName(course.name);
            setDescription(course.description || "");
            setPrice(course.price);
            setImageUrl(course.imageUrl || "");
            setIsPublished(course.isPublished);
            setIsFree(course.isFree);
        } else {
            setName("");
            setDescription("");
            setPrice("");
            setImageUrl("");
            setIsPublished(false);
            setIsFree(false);
        }
    }, [course, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = course ? "PUT" : "POST";
            const body = course
                ? { id: course.id, name, description, price, imageUrl, isPublished, isFree }
                : { name, description, price, imageUrl, isPublished, isFree };

            const response = await fetch("/api/admin/courses", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save course");
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
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {course ? "Edit Course" : "Create Course"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Course Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Introduction to Programming"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Course description..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="999"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Course Image</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="/courses"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Or paste Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPublished"
                                checked={isPublished}
                                onCheckedChange={(checked) => setIsPublished(checked as boolean)}
                            />
                            <Label htmlFor="isPublished" className="cursor-pointer">
                                Publish course (make visible to users)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isFree"
                                checked={isFree}
                                onCheckedChange={(checked) => setIsFree(checked as boolean)}
                            />
                            <Label htmlFor="isFree" className="cursor-pointer">
                                Free course (no enrollment required)
                            </Label>
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
                            {loading ? "Saving..." : course ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
