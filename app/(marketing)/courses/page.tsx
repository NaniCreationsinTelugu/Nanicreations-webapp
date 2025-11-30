
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award } from "lucide-react";
import { db } from "@/db/drizzle";
import { course } from "@/db/schema";

const Courses = async () => {
  const courses = await db.select().from(course);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Learn With SmartBit</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive courses designed to take you from beginner to expert
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="animate-scale-in hover:shadow-hover transition-shadow">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {course.level}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${course.price}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{course.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">{course.description}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Certificate included</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Enroll Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Courses;
