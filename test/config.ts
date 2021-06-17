import * as dotenv from "dotenv";
import * as path from "path";
import { TenableIntegrationConfig } from "../src/config";

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, "../.env"),
  });
}

export const config: TenableIntegrationConfig = {
  accessKey: process.env.ACCESS_KEY || "accessKey",
  secretKey: process.env.SECRET_KEY || "secretKey",
};
