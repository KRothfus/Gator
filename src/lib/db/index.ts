import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { readConfig } from "../../config";
import { listenerCount } from "process";

const config = readConfig();
const conn = postgres(config.dbUrl);
export const db = drizzle(conn, { schema });
// oh hello...oh hello...
// perfect