"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Video } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
    id: number;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    videoCount: number;
    isFree: boolean;
}

const CourseCard = ({ id, name, description, price, imageUrl, videoCount, isFree }: CourseCardProps) => {
    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-hover animate-scale-in py-0">
            <Link href={`/courses/${id}`}>
                <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <Video className="h-16 w-16 text-primary/40" />
                            </div>
                        )}
                        {isFree && (
                            <div className="absolute left-3 top-3">
                                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                                    FREE
                                </span>
                            </div>
                        )}
                        <div className="absolute right-3 bottom-3">
                            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                {videoCount} videos
                            </span>
                        </div>
                    </div>
                </CardHeader>
            </Link>
            <CardContent className="p-4">
                <Link href={`/courses/${id}`}>
                    <h3 className="mb-2 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
                        {name}
                    </h3>
                </Link>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {description || "Learn and master new skills with this comprehensive course."}
                </p>
                <p className="text-xl font-bold text-primary">
                    {isFree ? "FREE" : `₹${parseFloat(price).toFixed(2)}`}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/courses/${id}`} className="w-full">
                    <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {isFree ? "Start Learning" : "View Course"}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default CourseCard;
