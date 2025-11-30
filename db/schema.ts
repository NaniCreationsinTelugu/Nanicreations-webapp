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
  }
);

