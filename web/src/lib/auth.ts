import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

const jwtSecret = () => requiredEnvironmentVariable("JWT_SECRET");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const refreshSecret = () => requiredEnvironmentVariable("JWT_REFRESH_SECRET");
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export interface JWTPayload {
  sessionVersion?: number;
  userId: string;
  role: string;
  phone: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, jwtSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, jwtSecret()) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function generateOTP(): string {
  return randomInt(1000, 10000).toString();
}

export function generateJobNumber(): string {
  const prefix = "JOB";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function generateProjectNumber(): string {
  const prefix = "PRJ";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Refresh token functions
export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, refreshSecret(), { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, refreshSecret()) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
