import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(category);
  return NextResponse.json(rows);
}
