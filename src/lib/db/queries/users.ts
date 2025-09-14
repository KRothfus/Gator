import { sql, eq } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, users as usersSchema } from "../schema";
import { readConfig, setUser } from "src/config";


export async function createUser(name: string) {
  const [result] = await db.insert(usersSchema).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(usersSchema).where(eq(usersSchema.name, name));
  return result;
}

export async function getUsers() {
    const results = await db.select().from(usersSchema)
    return results
}


export async function getUserById(user_id: string){
    const user_name = await db.select().from(usersSchema).where(eq(usersSchema.id,user_id))
    return user_name[0] ?? undefined
}

export async function users() {
    const results = await getUsers()
    const currentUser = readConfig().currentUserName
    results.forEach((user)=>{
        if(currentUser === user.name){
        console.log(`* ${user.name} (current)`)
        }else{
            console.log(`* ${user.name}`)
        }
    })
}

// export async function reset(){
//     try{
//     const [result] = await db.delete(usersSchema)
//     const feedFollowsDeleted = await db.delete(feed_follows)
//     const feedsDeleted = await db.delete(feeds)
//   }catch(error){
//     console.log(error)
//     process.exit(1)
//   }
//   console.log('Database reset successfully.')
//   process.exit(0)
// }


export async function reset(){
    try{
        // Drop tables in the right order (due to foreign key constraints)
        await db.execute(sql`DROP TABLE IF EXISTS feed_follows CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS feeds CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
        await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
        
        console.log('Database reset successfully - all tables dropped.');
        process.exit(0);
    } catch(error){
        console.log(error);
        process.exit(1);
    }
}

export async function registerHandler(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw Error("Must enter USERNAME.");
  }
  const userExists = await getUser(args[0]);
  if (!userExists) {
    try {
     const userData = await createUser(args[0]);
      console.log(`User ${args[0]} created`)
      setUser(args[0]);
      console.log(userData)
      
    } catch (error) {
      throw Error(`User not created: ${error}`);
    }
  } else {
    throw Error("User already exists.");
  }
}
