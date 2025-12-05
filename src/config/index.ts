import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT,
  database_url: process.env.DATABASEURL,
  jwt_secrate: process.env.JWTSECRET,
};

export default config;
