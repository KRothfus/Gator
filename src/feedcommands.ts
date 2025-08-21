import { readConfig } from "./config";
import { db } from "./lib/db";
import { getUser, getUserById } from "./lib/db/queries/users";
import { feed_follows, feeds, users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

export async function createFeed(feedName: string, feedURL: string, currentUserId: string) {
    const [result] = await db.insert(feeds).values({name: feedName, url: feedURL, user_id: currentUserId}).returning();
      return result;
}

export async function addfeed(cmdName: string, feedName: string, feedURL:string) {
    const currentUser = readConfig().currentUserName
    const currentUserId = (await getUser(currentUser))
    if(!currentUserId){
        throw new Error(`User ${currentUser} not found`)
    }
    const feedCreated = await createFeed(feedName, feedURL, currentUserId.id)
    await follow("",feedCreated.url)
    
}

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect

function printFeed(feed: Feed, user: User) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
}

export async function feedsHandler() {
    const feedQuery = await db.select().from(feeds)
    if(feedQuery.length === 0){
        throw new Error("No feeds found")
    }
    for (let item of feedQuery){
        const user = await getUserById(item.user_id)
        if(!user){
            throw new Error(`Failed ot find user for feed ${item.user_id}`)
        }
        printFeed(item,user);
        console.log('==========================');
    }    
}

export type FeedFollow = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    user_id: string;
    feed_id: string;
}

export async function createFeedFollow(feedFollows:FeedFollow, userId: string) {
    feedFollows.user_id = userId;
    const [newFeedFollow] = await db.insert(feed_follows).values(feedFollows).returning();

    const result = await db.select({
        id: feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        user_id: feed_follows.user_id,
        feed_id: feed_follows.feed_id,
        feed_name: feeds.name,
        user_name: users.name
    })
    .from(feed_follows).innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .where(eq(feed_follows.id, newFeedFollow.id));
    if (result.length === 0) {
        throw new Error("Failed to create feed follow");
    }
    return result;
}

// this is just to save my streak! twice

export async function follow(cmdName: string, url: string) {
    const currentUser = readConfig().currentUserName;
    const currentUserId = (await getUser(currentUser))?.id;
    if (!currentUserId) {
        throw new Error(`User ${currentUser} not found`);
    }

    const feed = await db.select().from(feeds).where(eq(feeds.url, url)).limit(1);

   if(feed.length === 0) {
        throw new Error(`Feed with URL ${url} not found`);
    }

    const feedFollowed: FeedFollow = {
        user_id: currentUserId,
        feed_id: feed[0].id,
    };

    const createdFeedFollow = await createFeedFollow(feedFollowed, currentUserId);
    console.log(`Feed followed: ${createdFeedFollow[0].feed_name} by ${createdFeedFollow[0].user_name}`);
    // return createdFeedFollow
}

export async function getFeedFollowsForUser(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("Username is required");
    }
    const userName = args[0];
    const userID = (await getUser(userName))?.id;
    if (!userID) {
        throw new Error(`User ${userName} not found`);
    }
    const feedFollows = await db.select().from(feed_follows).where(eq(feed_follows.user_id, userID));
    if (feedFollows.length === 0) {
        throw new Error(`No feed follows found for user ${userName}`);
    }
    return feedFollows;
    
}


// This function lists all feeds followed by the current user and I need to figure out why it is not working
// It should be called with no arguments, as it uses the current user from the config
// Haven't continued on this but will do so tomorrow (8/21/25)
export async function following() {
    const currentUser = readConfig().currentUserName;
    // const currentUserId = (await getUser(currentUser))?.id;
    // if (!currentUserId) {
    //     throw new Error(`User ${currentUser} not found`);
    // }
    const feedsFollowed = await getFeedFollowsForUser("",currentUser);
    if (!feedsFollowed) {
        throw new Error(`No feeds followed by user ${currentUser}`);
    }
    // console.log(`* User: ${currentUser}`);
    for (const feedFollow of feedsFollowed) {
        const feedName  = await getFeedbyId(feedFollow.feed_id);
        console.log(`${feedName.name}`);
    }
}

async function getFeedbyId(feedId: string) {
    const feed = await db.select().from(feeds).where(eq(feeds.id, feedId)).limit(1);
    if (feed.length === 0) {
        throw new Error(`Feed with ID ${feedId} not found`);
    }
    return feed[0];
}