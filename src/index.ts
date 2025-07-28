import { handlerLogin, readConfig, registerCommand, runCommand, setUser } from "./config"
import { CommandsRegistry} from "./config"

function main(){
   const registry: CommandsRegistry = {}
   registerCommand(registry,"login",handlerLogin)
   const inputs = process.argv
   const args = inputs.slice(2)
    const func = args[0]
    const func_args = args.slice(1)
   runCommand(registry,func,...func_args)
}

main()