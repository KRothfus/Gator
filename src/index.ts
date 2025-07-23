import { readConfig, setUser } from "./config"


function main(){
    setUser("Kellan")
    const read = readConfig() 
    console.log(read)
}

main()