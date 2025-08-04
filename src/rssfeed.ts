import  { XMLParser} from "fast-xml-parser";

type RSSItem = {
    title: string,
    link: string,
    description: string,
    pubDate: string
}

export async function fetchFeed(feedURL: string){
const data = (await fetch('gator')).text()
const parser = new XMLParser();
const jsonObj = parser.parse(data)
if (jsonObj.channel){

}else{
    throw Error(`Channel does not exist.`)
}
if (jsonObj.channel.title || jsonObj.channel.link || jsonObj.channel.description){
    const title = jsonObj.channel.title
    const link = jsonObj.channel.link
    const description = jsonObj.channel.description
}else{
    throw Error(`One of the following does not exist on the channel: Title, Link, Description`)
}
if (!Array.isArray(jsonObj.channel.item)){
    jsonObj.channel.item = []
}
jsonObj.channel.item.forEach((item: RSSItem)=>{ //Need to figure out what it means by 'extract'.
    const itemTitle = item.title
    const itemLink = item.link
    const itemDescription = item.description
    const itemPubDate = item.pubDate
})

}

export async function agg() {
    const data = await fetch('https://www.wagslane.dev/index.xml')
    console.log(data.json())
    
}