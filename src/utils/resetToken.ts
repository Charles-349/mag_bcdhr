import crypto from "crypto";
import db from "../Drizzle/db";
import { passwordResets } from "../Drizzle/schema";

export const createPasswordResetToken = async (email: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await db.insert(passwordResets).values({
    email,
    token,
    expiresAt,
  });

  return token;
};
