import { eq, and } from "drizzle-orm";
import { User } from "src/feedcommands";
import { db } from "src/lib/db";
import { feeds, feed_follows } from "src/lib/db/schema";

export const unfollow = async (cmdName: string, user: User, ...args: string[]) => {
    const url = args[0];
    const currentUser = user.name //readConfig().currentUserName;
    const currentUserId = user.id //await getUser(currentUser);

    const feed = await db.select().from(feeds).where(eq(feeds.url, url)).limit(1);
    if (feed.length === 0) {
        console.log(`Feed with URL ${url} not found`);
        return;
    }
    const deleteResult = await db.delete(feed_follows)
        .where(and(
            eq(feed_follows.user_id, currentUserId),
            eq(feed_follows.feed_id, feed[0].id)
        ))
        .returning();

    if (deleteResult.length === 0) {
        console.log(`You are not following the feed with URL ${url}`);
    } else {
        console.log(`Unfollowed feed: ${feed[0].name}`);
    }
}