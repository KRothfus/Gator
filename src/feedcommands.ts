import { readConfig } from "./config";
import { db } from "./lib/db";
import { getUser, getUserById } from "./lib/db/queries/users";
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


