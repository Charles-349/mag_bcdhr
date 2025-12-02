import Jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import db from "../Drizzle/db";
import { rolePermissions, permissions, roles } from "../Drizzle/schema";
import { eq } from "drizzle-orm"; 

export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY!);
      (req as any).user = decoded;

      const roleId = (decoded as any).roleId;
      if (!roleId) {
        return res.status(403).json({ message: "No role assigned" });
      }

      const rolePerms = await db.query.rolePermissions.findMany({
        where: (rp) => eq(rp.roleId, roleId),
        with: {
          permission: true,
        },
      });

      const userPerms = rolePerms.map((rp) => rp.permission.name);
      if (!userPerms.includes(requiredPermission)) {
        return res.status(403).json({ message: "You do not have permission" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
