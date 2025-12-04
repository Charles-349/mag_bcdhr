import Jwt, { SignOptions } from "jsonwebtoken";

export const signToken = (payload: object, expiresIn: SignOptions['expiresIn'] = "1d") => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in environment");
  }

  // Explicitly type options 
  const options: SignOptions = { expiresIn };

  return Jwt.sign(payload, secret, options);
};

export const verifyToken = <T = any>(token: string): T => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in environment");
  }

  return Jwt.verify(token, secret) as T;
};
