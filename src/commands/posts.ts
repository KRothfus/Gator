
export type Post = {
  id: string;
  title: string;
  url: string;
  feedId: string;
  publishedAt: Date;
  description: string | null;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

import { db } from "../lib/db/index";
import { posts, feeds, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

import { getUserById } from "../lib/db/queries/users";
import { get } from "http";
import { read } from "fs";
import { readConfig } from "src/config";

// Placeholder functions for post-related operations
export async function createPost(post: Post) {
    const now = new Date();
    return db.insert(posts).values({
        ...post,
        createdAt: post.createdAt ?? now,
        updatedAt: post.updatedAt ?? now,
    }).returning();
}
//what is the issue here? 
export async function getPostsForUser(numPosts: number, userId: string) {
    const allPosts = await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(posts.publishedAt).limit(numPosts);
    return allPosts;
}

export async function browse(cmdName: string, ...args: string[]) {
    const numPosts = args[0] ? parseInt(args[0]) : 2;
    const userName = readConfig().currentUserName;
    const userId = await getUserById(userName);
    if (!userId) {
        console.log("No user logged in.");
        return;
    }
    const allPosts = await getPostsForUser(numPosts, userId.id);
    if (!allPosts) {
        console.log("No posts found.");
        return;
    }
    for (let post of allPosts) {
        console.log(`* Title:       ${post.title}`);
        console.log(`  URL:         ${post.url}`);
        console.log(`  Published:   ${post.publishedAt}`);
        console.log(`  Description: ${post.description}`);
    }
} //left the door open...