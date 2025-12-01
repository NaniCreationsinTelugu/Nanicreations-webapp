import { integer, text, boolean, pgTable, numeric, real, index, uniqueIndex } from "drizzle-orm/pg-core";

export const category = pgTable(
  "category",
  {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("category_slug_unique").on(table.slug),
  })
);

export const product = pgTable(
  "product",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    image: text("image").notNull(),
    categoryId: integer("category_id").notNull().references(() => category.id),
    inStock: boolean("in_stock").default(true).notNull(),
    rating: real("rating").default(0).notNull(),
    reviewsCount: integer("reviews_count").default(0).notNull(),
    images: text("images").array(),
    specifications: text("specifications").array(),
    features: text("features").array(),
  },
  (table) => ({
    categoryIdx: index("product_category_idx").on(table.categoryId),
  })
);

export const course = pgTable(
  "course",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    level: text("level").notNull(),
    duration: text("duration").notNull(),
    lessons: integer("lessons").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    thumbnail: text("thumbnail"),
  }
);

export const enrollment = pgTable(
  "enrollment",
  {
    id: integer("id").primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID
    courseId: integer("course_id").notNull().references(() => course.id),
    enrolledAt: text("enrolled_at").notNull(), // ISO timestamp
    paymentSessionId: text("payment_session_id"), // Nullable for free enrollments
  },
  (table) => ({
    userCourseIdx: uniqueIndex("enrollment_user_course_idx").on(table.userId, table.courseId),
    courseIdx: index("enrollment_course_idx").on(table.courseId),
  })
);

export const courseVideo = pgTable(
  "course_video",
  {
    id: integer("id").primaryKey(),
    courseId: integer("course_id").notNull().references(() => course.id),
    title: text("title").notNull(),
    youtubeUrl: text("youtube_url").notNull(),
    duration: text("duration"), // e.g., "10:30"
    order: integer("order").notNull(), // Display order in playlist
    description: text("description"),
  },
  (table) => ({
    courseIdx: index("course_video_course_idx").on(table.courseId),
    orderIdx: index("course_video_order_idx").on(table.courseId, table.order),
  })
);

export const paymentSession = pgTable(
  "payment_session",
  {
    id: integer("id").primaryKey(),
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    userId: text("user_id").notNull(),
    courseId: integer("course_id").notNull().references(() => course.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: text("status").notNull(), // 'pending', 'completed', 'failed'
    createdAt: text("created_at").notNull(),
    completedAt: text("completed_at"),
  },
  (table) => ({
    sessionIdx: uniqueIndex("payment_session_stripe_idx").on(table.stripeSessionId),
  })
);

