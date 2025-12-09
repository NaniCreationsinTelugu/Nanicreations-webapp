import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { course, enrollment, courseVideo } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import CourseViewer from "./CourseViewer";

interface CoursePageProps {
    params: Promise<{
        courseId: string;
    }>;
    searchParams: Promise<{
        success?: string;
    }>;
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
    const user = await currentUser();
    const { courseId } = await params;
    const { success } = await searchParams;

    if (!user) {
        redirect('/sign-in');
    }

    const courseIdNum = parseInt(courseId);
    if (isNaN(courseIdNum)) {
        notFound();
    }

    // Fetch course details first
    const [courseData] = await db
        .select()
        .from(course)
        .where(eq(course.id, courseIdNum))
        .limit(1);

    if (!courseData) {
        notFound();
    }

    // Check if course is free - if not, check enrollment
    if (!courseData.isFree) {
        const [enrollmentRecord] = await db
            .select()
            .from(enrollment)
            .where(
                and(
                    eq(enrollment.userId, user.id),
                    eq(enrollment.courseId, courseIdNum)
                )
            )
            .limit(1);

        if (!enrollmentRecord) {
            redirect('/courses');
        }
    }

    // Fetch course videos
    const videos = await db
        .select()
        .from(courseVideo)
        .where(eq(courseVideo.courseId, courseIdNum))
        .orderBy(asc(courseVideo.order));

    return (
        <CourseViewer
            courseData={courseData}
            videos={videos}
            showSuccess={success === 'true'}
        />
    );
}
