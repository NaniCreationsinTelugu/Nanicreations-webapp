"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Collection {
    id: number;
    name: string;
    slug: string;
}

interface CollectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collection?: Collection | null;
    onSuccess: () => void;
}

export function CollectionModal({
    open,
    onOpenChange,
    collection,
    onSuccess,
}: CollectionModalProps) {
    const [name, setName] = useState(collection?.name || "");
    const [slug, setSlug] = useState(collection?.slug || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Reset form when modal opens/closes or collection changes
    useState(() => {
        if (open) {
            setName(collection?.name || "");
            setSlug(collection?.slug || "");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !slug.trim()) {
            toast({
                title: "Validation Error",
                description: "Name and slug are required",

            });
            return;
        }

        setIsSubmitting(true);

        try {
            const method = collection ? "PUT" : "POST";
            const body = collection
                ? JSON.stringify({ id: collection.id, name, slug })
                : JSON.stringify({ name, slug });

            const response = await fetch("/api/categories", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save collection");
            }

            toast({
                title: "Success",
                description: collection
                    ? "Collection updated successfully"
                    : "Collection created successfully",
            });

            onSuccess();
            onOpenChange(false);
            setName("");
            setSlug("");
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred",

            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {collection ? "Edit Collection" : "Add Collection"}
                        </DialogTitle>
                        <DialogDescription>
                            {collection
                                ? "Update the collection details below"
                                : "Create a new collection by filling in the details below"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Handicrafts"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g., handicrafts"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in URLs, should be unique and lowercase
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : collection ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
