import { error } from "console";
import fs from "fs";
import os from "os";
import path from "path";
import { getUser } from "./lib/db/queries/users";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(userName: string) {
  const config = readConfig();
  const user = { dbUrl: config.dbUrl, currentUserName: userName };
  writeConfig(user);
}

export function readConfig(): Config {
  const conf = fs.readFileSync(getConfigFilePath(), "utf-8");
  const valid_conf = validateConfig(JSON.parse(conf));
  return valid_conf;
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config) {
  const cfg_json = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(cfg_json));
}

function validateConfig(rawConfig: any): Config {
  if (rawConfig.db_url && rawConfig.current_user_name) {
    return {
      dbUrl: rawConfig.db_url,
      currentUserName: rawConfig.current_user_name,
    };
  } else {
    return { dbUrl: rawConfig.db_url, currentUserName: "" };
  }
}

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw Error("Enter username.");
  }
  const userCheck = await getUser(args[0])
  if (!userCheck){
    throw Error(`${args[0]} does not exists.`)
  }
  setUser(args[0]);
  console.log(`${args[0]} has been set`);
}

export async function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
) {
    registry[cmdName] = handler
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
    const command = registry[cmdName]
    if(command){
    await command(cmdName,...args)
    }else{
       throw Error(`${cmdName} does not exist.`)
    }
}
