require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 5000),
  db: {
    url: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === "true",
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false"
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
  },
  corsOrigin: process.env.CORS_ORIGIN || "",
  cookieDomain: process.env.COOKIE_DOMAIN || "",
  allowVercelOrigins: process.env.ALLOW_VERCEL_ORIGINS !== "false",
  nodeEnv: process.env.NODE_ENV || "development"
};

module.exports = env;
