
import { integer, pgTable, varchar, text, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

// Product Options (e.g., Size, Color, Kit Type)
export const productOptions = pgTable("product_options", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer().references(() => product.id).notNull(),
  name: varchar({ length: 255 }).notNull(), // e.g., "Size", "Color"
  position: integer().default(0).notNull(), // For ordering in UI
});

// Product Option Values (e.g., Small, Red, Build Yourself)
export const productOptionValues = pgTable("product_option_values", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  optionId: integer().references(() => productOptions.id).notNull(),
  name: varchar({ length: 255 }).notNull(), // e.g., "Small", "Red"
  position: integer().default(0).notNull(), // For ordering in UI
});

// Product Variants (Unique combination of option values)
export const productVariants = pgTable("product_variants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer().references(() => product.id).notNull(),
  sku: varchar({ length: 255 }),
  price: decimal({ precision: 10, scale: 2 }), // Override base price
  stock: integer().default(0).notNull(),
  image: text(), // Variant specific image
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Link Variants to Option Values (Many-to-Many logic but specific to Variant definition)
export const variantOptionValues = pgTable("variant_option_values", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  variantId: integer().references(() => productVariants.id).notNull(),
  optionValueId: integer().references(() => productOptionValues.id).notNull(),
});

// Coupons System
export const coupons = pgTable("coupons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: varchar({ length: 50 }).notNull().unique(),
  type: varchar({ length: 20 }).notNull(), // 'percentage' | 'fixed'
  value: decimal({ precision: 10, scale: 2 }).notNull(),
  minCartValue: decimal({ precision: 10, scale: 2 }),
  maxDiscount: decimal({ precision: 10, scale: 2 }), // For percentage coupons
  startDate: timestamp(),
  endDate: timestamp(),
  usageLimit: integer(), // Global usage limit
  usageLimitPerUser: integer(), // Per user usage limit
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

// Coupon Usages
export const couponUsages = pgTable("coupon_usages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  couponId: integer().references(() => coupons.id).notNull(),
  userId: varchar({ length: 255 }).notNull(),
  orderId: integer(), // Linked later to orders
  usedAt: timestamp().defaultNow().notNull(),
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
  discountAmount: decimal({ precision: 10, scale: 2 }).default("0"), // Added discount amount
  couponId: integer().references(() => coupons.id), // Link to coupon if used
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
  variantId: integer().references(() => productVariants.id), // Link to specific variant
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


// Relations
export const productRelations = relations(product, ({ many }) => ({
  options: many(productOptions),
  variants: many(productVariants),
}));

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(product, {
    fields: [productOptions.productId],
    references: [product.id],
  }),
  values: many(productOptionValues),
}));

export const productOptionValuesRelations = relations(productOptionValues, ({ one }) => ({
  option: one(productOptions, {
    fields: [productOptionValues.optionId],
    references: [productOptions.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(product, {
    fields: [productVariants.productId],
    references: [product.id],
  }),
  optionValues: many(variantOptionValues),
}));

export const variantOptionValuesRelations = relations(variantOptionValues, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantOptionValues.variantId],
    references: [productVariants.id],
  }),
  optionValue: one(productOptionValues, {
    fields: [variantOptionValues.optionValueId],
    references: [productOptionValues.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsages),
}));

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsages.couponId],
    references: [coupons.id],
  }),
}));
