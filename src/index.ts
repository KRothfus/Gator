import {
  handlerLogin,
  readConfig,
  registerCommand,
  runCommand,
  setUser,
} from "./config";
import { CommandsRegistry } from "./config";
import {  registerHandler, reset, users } from "./lib/db/queries/users";
import { agg } from "./rssfeed";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register",registerHandler)
  registerCommand(registry,'reset',reset)
  registerCommand(registry,'users',users)
  registerCommand(registry,"agg", agg)
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

  process.exit(0)
}

main();
