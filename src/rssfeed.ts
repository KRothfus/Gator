import { XMLParser } from "fast-xml-parser";

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

export async function agg() {
  try {
    const url = "https://www.wagslane.dev/index.xml";
    const rssFeed = await fetchFeed(url);
    console.log(JSON.stringify(rssFeed, null, 2));
  } catch (error) {
    console.error("Error fetching or parsing feed:", error);
  }
}
