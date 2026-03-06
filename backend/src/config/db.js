const knex = require("knex");
const env = require("./env");

function getConnectionConfig() {
  if (env.db.url) {
    try {
      const parsed = new URL(env.db.url);
      const sslMode = (parsed.searchParams.get("ssl-mode") || "").toUpperCase();
      const sslRequired = sslMode === "REQUIRED" || env.db.ssl;
      return {
        host: parsed.hostname,
        port: Number(parsed.port || env.db.port || 3306),
        user: decodeURIComponent(parsed.username || env.db.user || ""),
        password: decodeURIComponent(parsed.password || env.db.password || ""),
        database: decodeURIComponent(parsed.pathname.replace(/^\//, "") || env.db.name || ""),
        ssl: sslRequired ? { rejectUnauthorized: env.db.sslRejectUnauthorized } : undefined
      };
    } catch {
      // Fall through to field-based config.
    }
  }

  return {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    ssl: env.db.ssl ? { rejectUnauthorized: env.db.sslRejectUnauthorized } : undefined
  };
}

const db = knex({
  client: "mysql2",
  connection: getConnectionConfig(),
  pool: { min: 2, max: 10 }
});

module.exports = db;
