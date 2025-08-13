import { sql, eq } from "drizzle-orm";
import { db } from "..";
import { users as usersSchema } from "../schema";
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

export async function reset(){
    try{
    const [result] = await db.delete(usersSchema)
    console.log('Database reset successfully.')
    process.exit(0)
    }catch(error){
        console.log(error)
        process.exit(1)
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
