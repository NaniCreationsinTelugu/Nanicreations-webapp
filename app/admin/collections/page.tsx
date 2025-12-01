import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CollectionsPage() {
    const collections = await db.select().from(category);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Collections</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Collection
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                    <Card key={collection.id}>
                        <CardHeader>
                            <CardTitle>{collection.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Slug: {collection.slug}</p>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {collections.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                        No collections found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
