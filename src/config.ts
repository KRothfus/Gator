import { error } from "console";
import fs from "fs";
import os from "os";
import path from "path";



export type Config = {
    dbUrl: string,
    currentUserName: string
}

type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => void;

type ComamndsRegistry = {
    commands: Record<string,CommandHandler>
}

export function setUser(userName: string){
    const config = readConfig()
    const user = {dbUrl: config.dbUrl,
        currentUserName: userName
    }
    writeConfig(user)
}

export function readConfig(): Config{
    const conf = fs.readFileSync(getConfigFilePath(),"utf-8")
    const valid_conf = validateConfig(JSON.parse(conf))
    return valid_conf

}

function getConfigFilePath(): string{
return path.join(os.homedir(),"/Gator/.gatorconfig.json")
}

function writeConfig(cfg: Config){
    const cfg_json = {db_url: cfg.dbUrl, current_user_name: cfg.currentUserName}
    fs.writeFileSync(getConfigFilePath(),JSON.stringify(cfg_json))
}

function validateConfig(rawConfig: any): Config{
    if(rawConfig.db_url && rawConfig.current_user_name){
        return {dbUrl: rawConfig.db_url, currentUserName: rawConfig.current_user_name}
    }else{
        return {dbUrl: rawConfig.db_url, currentUserName: ""}
    }
}

export function handlerLogin(cmdName: string, ...args: string[]){
    if(args.length === 0){
        throw error("Enter username.")
    }
    setUser(args[0])
    console.log(`${args[0]} has been set`)
}