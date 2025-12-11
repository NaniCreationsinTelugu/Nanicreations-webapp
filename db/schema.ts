
import { integer, pgTable, varchar, text, timestamp, decimal, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const category = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const product = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  categoryId: integer().references(() => category.id),
  images: text().array(), // Array of image URLs
  stock: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const course = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  imageUrl: text(),
  videoCount: integer().default(0).notNull(),
  isPublished: boolean().default(false).notNull(),
  isFree: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Enrollment table updated for Razorpay
export const enrollment = pgTable("enrollments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  courseId: integer().references(() => course.id).notNull(),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }), // Changed from stripeSessionId
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }), // Added for payment verification
  paymentStatus: varchar({ length: 50 }).default("pending").notNull(), // pending, completed, failed
  enrolledAt: timestamp().defaultNow().notNull(),
});

// Deprecated or repurposed payment session (keeping for now but focusing on Orders)
export const paymentSession = pgTable("payment_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderId: varchar({ length: 255 }).notNull().unique(), // Changed from sessionId
  userId: varchar({ length: 255 }).notNull(),
  courseId: integer().references(() => course.id).notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  status: varchar({ length: 50 }).default("pending").notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

// New Orders table for Physical Products & Cart
export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(),
  totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
  status: varchar({ length: 50 }).default("pending").notNull(), // pending, paid, failed, shipped, delivered
  address: text("address"), // Storing JSON string of address
  shippingMethod: varchar({ length: 50 }).notNull(),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Order Items table
export const orderItems = pgTable("order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer().references(() => orders.id).notNull(),
  productId: integer().references(() => product.id).notNull(),
  quantity: integer().notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(), // Price at time of purchase
});

export const courseVideo = pgTable("course_videos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  youtubeUrl: text().notNull(),
  duration: varchar({ length: 20 }),
  description: text(),
  order: integer().notNull(),
  courseId: integer().references(() => course.id).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
