const crypto = require("crypto");
const createError = require("http-errors");
const db = require("../../config/db");
const { hashPassword, comparePassword } = require("../../utils/password");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const userModel = require("../users/user.model");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: String(user.id), email: user.email, name: user.name });
  const refreshToken = signRefreshToken({ sub: String(user.id) });
  await db("refresh_tokens").insert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: refreshExpiryDate()
  });
  return { accessToken, refreshToken };
}

async function register(payload) {
  const existing = await userModel.findByEmail(payload.email);
  if (existing) throw createError(409, "Email already registered");
  const password_hash = await hashPassword(payload.password);
  const user = await userModel.createUser({ email: payload.email, password_hash, name: payload.name });
  const tokens = await issueTokens(user);
  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) throw createError(401, "Invalid credentials");

  let valid = false;
  if (user.password_hash) {
    valid = await comparePassword(password, user.password_hash);
  } else if (user.password) {
    // Legacy account compatibility: migrate plain-text password users to hashed passwords on successful login.
    valid = String(password) === String(user.password);
    if (valid) {
      const newHash = await hashPassword(password);
      await userModel.updatePasswordHash(user.id, newHash);
    }
  }

  if (!valid) throw createError(401, "Invalid credentials");
  const tokens = await issueTokens(user);
  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw createError(401, "Refresh token missing");
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createError(401, "Invalid refresh token");
  }
  const tokenHash = hashToken(refreshToken);
  const row = await db("refresh_tokens")
    .where({ user_id: Number(payload.sub), token_hash: tokenHash })
    .whereNull("revoked_at")
    .andWhere("expires_at", ">", new Date())
    .first();
  if (!row) throw createError(401, "Refresh token revoked or expired");
  const user = await userModel.findById(Number(payload.sub));
  if (!user) throw createError(401, "User not found");
  const accessToken = signAccessToken({ sub: String(user.id), email: user.email, name: user.name });
  return { accessToken, user: { id: user.id, email: user.email, name: user.name } };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await db("refresh_tokens").where({ token_hash: hashToken(refreshToken) }).update({ revoked_at: new Date() });
}

module.exports = { register, login, refresh, logout };
