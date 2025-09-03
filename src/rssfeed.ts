import { XMLParser } from "fast-xml-parser";
import { db } from "./lib/db";
import { feeds } from "./lib/db/schema";
import { eq, sql } from "drizzle-orm";

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, { headers: { "User-Agent": "gator" } });
  const data = await response.text();
  const parser = new XMLParser();
  const jsonObj = parser.parse(data);
  if (jsonObj.rss.channel) {
  } else {
    throw Error(`Channel does not exist.`);
  }
  const channel = jsonObj.rss.channel
  const channelTitle = channel.title;
  const channelLink = channel.link;
  const channelDescription = channel.description;
  if (
    !channel ||
    !channelTitle ||
    !channelLink ||
    !channelDescription
  ) {
    throw Error(
      `One of the following does not exist on the channel: Title, Link, Description`
    );
  }
  if (!Array.isArray(channel.item)) {
    channel.item = [];
  }
  const items: RSSItem[] = [];

  channel.item.forEach((item: any) => {
    //Need to figure out what it means by 'extract'.
    if (item.title && item.link && item.description && item.pubDate) {
      items.push({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate,
      } as RSSItem);
    }
  });
  return {
    channel: {
      title: channelTitle,
      link: channelLink,
      description: channelDescription,
      item: items,
    },
  };
}
// keep the streak!


export async function agg(time_between_reqs: string) {
const delay = parseDuration(time_between_reqs);
console.log(`Collecting feeds every ${time_between_reqs}`);
try{
await scrapeFeeds();
} catch (e) {
  console.log(`Error during initial scrape: ${e}`);
}

const interval = setInterval(async () => {
  try{
  await scrapeFeeds();
  } catch (e) {
    console.log(`Error during scheduled scrape: ${e}`);
  }
}, delay);

await new Promise<void>((resolve) => {
  process.on("SIGINT", () => {
    console.log("Shutting down feed aggregator...");
    clearInterval(interval);
    resolve();
  });
});
}

function parseDuration(duration: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
const match = duration.match(regex);
if (!match) {
  throw new Error("Invalid duration format");
}
const value = parseInt(match[1], 10);
const unit = match[2];
switch (unit) {
  case "ms":
    return value;
  case "s":
    return value * 1000;
  case "m":
    return value * 60 * 1000;
  case "h":
    return value * 60 * 60 * 1000;
  default:
    throw new Error("Invalid time unit");
}
}

export async function markFeedFetched(id: string) {
  await db.update(feeds).set({ last_fetched_at: new Date(), updatedAt: new Date() }).where(eq(feeds.id,id));
}

export async function getNextFeedToFetch() {
  const feed_to_fetch = await db.select().from(feeds).orderBy(sql`${feeds.last_fetched_at} asc nulls first`).limit(1);
  return feed_to_fetch[0];
}

export async function scrapeFeeds(){
  // get next feed to fetch from db
  
  const feed = await getNextFeedToFetch();
 if (!feed) { 
    console.log(`No feeds to fetch.`);
    return;
  }
  // fetch the feed using the url (func already written)
  try{
    const rssFeed = await fetchFeed(feed.url);
    // iterate over items in the feed and print titles to the console.
    rssFeed.channel.item.forEach((item) => {
      console.log(item.title);
    });
  } catch (e) {
    console.log(`Error fetching feed ${feed.url}: ${e}`);
    return;
  }
  // mark it as fetched
  markFeedFetched(feed.id);
}