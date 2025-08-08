
import { readConfig } from "./config";
import { db } from "./lib/db";
import { getUser } from "./lib/db/queries/users";
import { feeds, users } from "./lib/db/schema";

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
    printFeed(feedCreated, currentUserId)
}

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect

function printFeed(feed: Feed, user: User) {
    console.log(`Feed created successfully!`);
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`Created by: ${user.name}`);
    console.log(`Feed ID: ${feed.id}`);
    console.log(`Created at: ${feed.createdAt}`);
}