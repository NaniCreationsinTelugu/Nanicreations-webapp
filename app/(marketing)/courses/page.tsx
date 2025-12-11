'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import EnrollButton from "./EnrollButton";

type Course = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  videoCount: number;
  isPublished: boolean;
  isFree: boolean;
};

const Courses = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch courses
        const coursesRes = await fetch("/api/courses", { cache: "no-store" });
        const coursesData = await coursesRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        // Fetch user enrollments if logged in
        if (user) {
          const enrollmentsRes = await fetch("/api/enrollments", { cache: "no-store" });
          const enrollmentsData = await enrollmentsRes.json();
          const enrolledCourseIds = Array.isArray(enrollmentsData)
            ? enrollmentsData.map((e: any) => e.courseId)
            : [];
          setUserEnrollments(enrolledCourseIds);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
        setUserEnrollments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Learn With Nani Creations</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive courses designed to take you from beginner to expert
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((courseItem) => {
              const isEnrolled = userEnrollments.includes(courseItem.id);

              return (
                <Card key={courseItem.id} className="animate-scale-in hover:shadow-hover transition-shadow">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      {courseItem.imageUrl && (
                        <img
                          src={courseItem.imageUrl}
                          alt={courseItem.name}
                          className="mb-3 h-48 w-full rounded-md object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{courseItem.name}</h3>
                      {courseItem.isFree ? (
                        <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                          FREE
                        </span>
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          ₹{parseFloat(courseItem.price as string).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">{courseItem.description || "No description available"}</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{courseItem.videoCount} videos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Certificate included</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isEnrolled ? (
                      <Link href={`/courses/${courseItem.id}`} className="w-full">
                        <Button className="w-full" variant="default">
                          Continue Learning
                        </Button>
                      </Link>
                    ) : courseItem.isFree ? (
                      <Link href={`/courses/${courseItem.id}`} className="w-full">
                        <Button className="w-full" variant="default">
                          Access Course
                        </Button>
                      </Link>
                    ) : (
                      <EnrollButton courseId={courseItem.id} />
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">No Courses Available</h2>
            <p className="text-lg text-muted-foreground">
              We're working on creating amazing courses for you. Check back soon!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Courses;
