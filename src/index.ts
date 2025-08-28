import { unfollow } from "./commands/unfollow";
import {
  handlerLogin,
  readConfig,
  registerCommand,
  runCommand,
  setUser,
} from "./config";
import { CommandsRegistry } from "./config";
import { addfeed, feedsHandler, following, follow } from "./feedcommands";
import { registerHandler, reset, users } from "./lib/db/queries/users";
import { feeds } from "./lib/db/schema";
import { middlewareLoggedIn } from "./middleware";
import { agg } from "./rssfeed";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", registerHandler);
  registerCommand(registry, "reset", reset);
  registerCommand(registry, "users", users);
  registerCommand(registry, "agg", agg);
  // registerCommand(registry,"addfeed", addfeed)
  registerCommand(registry, "feeds", feedsHandler);
  registerCommand(registry, "follow", middlewareLoggedIn(follow));
  registerCommand(registry, "following", middlewareLoggedIn(following));
  registerCommand(registry, "addfeed", middlewareLoggedIn(addfeed));
  registerCommand(registry, "unfollow", middlewareLoggedIn(unfollow));
  const inputs = process.argv;
  const args = inputs.slice(2);

  if (args.length < 1) {
    console.log("No arguments given");
    process.exit(1);
  } else {
    const func = args[0];
    const func_args = args.slice(1);
    try {
      await runCommand(registry, func, ...func_args);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }

  process.exit(0);
}

main();
// What needs to be done here? HELP!
