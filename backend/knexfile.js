require("dotenv").config();

function getConnectionConfig() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      const sslMode = (parsed.searchParams.get("ssl-mode") || "").toUpperCase();
      const sslRequired = sslMode === "REQUIRED" || process.env.DB_SSL === "true";
      return {
        host: parsed.hostname,
        port: Number(parsed.port || process.env.DB_PORT || 3306),
        user: decodeURIComponent(parsed.username || process.env.DB_USER || ""),
        password: decodeURIComponent(parsed.password || process.env.DB_PASSWORD || ""),
        database: decodeURIComponent(parsed.pathname.replace(/^\//, "") || process.env.DB_NAME || ""),
        ssl: sslRequired
          ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
          : undefined
      };
    } catch {
      // Fall through to field-based config.
    }
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
        : undefined
  };
}

module.exports = {
  development: {
    client: "mysql2",
    connection: getConnectionConfig(),
    migrations: {
      directory: "./src/migrations"
    }
  }
};
