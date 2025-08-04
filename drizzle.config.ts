import { defineConfig } from "drizzle-kit";
import {readConfig} from './src/config'

export default defineConfig({
  schema: "Gator/src/lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: readConfig().dbUrl,
  },
});