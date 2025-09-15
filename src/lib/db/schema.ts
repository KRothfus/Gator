import { desc } from "drizzle-orm";
import { pgTable, timestamp, uuid, text, integer, unique } from "drizzle-orm/pg-core";
import { url } from "inspector";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  userId: uuid("user_id")  // Note: also changed from user_id to userId
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  lastFetchAt: timestamp("last_fetch_at"),  // Note: camelCase property name
});

export const feed_follows = pgTable("feed_follows", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  feed_id: uuid('feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
}, (table) => ({
  // This creates a composite unique constraint - a user can follow each feed only once
  unique_user_feed: unique().on(table.user_id, table.feed_id),
}));

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  feedId: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
  publishedAt: timestamp("published_at").notNull(),
  description: text("description"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});