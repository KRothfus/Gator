
export type Post = {
  id?: string;
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
import { posts, feeds, users, feed_follows } from "../lib/db/schema";
import { eq, desc } from "drizzle-orm";

import { getUser, getUserById } from "../lib/db/queries/users";
import { get } from "http";
import { read } from "fs";
import { readConfig } from "src/config";

// Placeholder functions for post-related operations
export async function createPost(post: Post) {
    const now = new Date();
    try {
        const existingPost = await db.select().from(posts).where(eq(posts.url, post.url)).limit(1);
        // if (existingPost.length > 0) {
        //     console.log(`Post with URL ${post.url} already exists. Skipping insertion.`);
        //     return ; // Return the existing post
        // }
    }
    catch (error) {
        console.error("Error checking for existing post:", error);
        return
    }

    return
}
//what is the issue here? 
export async function getPostsForUser(numPosts: number, userId: string) {
    
    // const allPosts = await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(posts.publishedAt).limit(numPosts);
    // return allPosts;
    const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feed_follows, eq(posts.feedId, feed_follows.feed_id))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feed_follows.user_id, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(numPosts);
  return result;
}

export async function browse(cmdName: string, ...args: string[]) {
    const numPosts = args[0] ? parseInt(args[0]) : 2;
    const userName = readConfig().currentUserName;
    const user = (await getUser(userName));
    const userId = user?.id;
    if (!userId) {
        console.log("No user logged in.");
        return;
    }
    const allPosts = await getPostsForUser(numPosts, userId);
    if (!allPosts || allPosts.length === 0) {
        console.log("No posts found.");
        return;
    }
    for (let post of allPosts) {
        console.log(`* Title:       ${post.title}`);
        console.log(`  URL:         ${post.url}`);
        console.log(`  Published:   ${post.publishedAt}`);
        console.log(`  Description: ${post.description}`);
    }
} //left the door open..
