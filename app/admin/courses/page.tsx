import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { course } from "@/db/schema";
import CourseManagement from "./CourseManagement";

export default async function CoursesPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const courses = await db.select().from(course);

    return <CourseManagement initialCourses={courses} />;
}

