const db = require("../../config/db");

function findByEmail(email) {
  return db("users").where({ email }).first();
}

function findById(id) {
  return db("users").where({ id }).first();
}

async function createUser({ email, password_hash, name }) {
  const [id] = await db("users").insert({ email, password_hash, name });
  return findById(id);
}

function updatePasswordHash(id, password_hash) {
  return db("users").where({ id }).update({ password_hash, updated_at: new Date() });
}

module.exports = { findByEmail, findById, createUser, updatePasswordHash };
