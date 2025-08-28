import { CommandHandler, readConfig } from "./config";
import { User } from "./feedcommands";
import { getUser } from "./lib/db/queries/users";

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn: middlewareLoggedIn = (handler) => {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    if (!config.currentUserName) {
      console.log("No user logged in. Please log in first.");
      process.exit(1);
    }
    const user = await getUser(config.currentUserName);
    if (!user) {
      console.log(
        `User ${config.currentUserName} not found in database. Please register first.`,
      );
      process.exit(1);
    }
    await handler(cmdName, user, ...args);
  };
};