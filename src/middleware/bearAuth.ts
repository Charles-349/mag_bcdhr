import Jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import db from "../Drizzle/db";
import { employees, rolePermissions } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

export const checkPermission = (
  requiredPermission: string,
  options: { allowBootstrap?: boolean } = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.allowBootstrap) {
        const employeesCount = await db.select().from(employees);
        if (employeesCount.length === 0) {
          return next();
        }
      }

      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token" });
      }

      const token = authHeader.split(" ")[1];

      let decoded: any;
      try {
        decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY!);
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      (req as any).user = decoded;

      const roleId = decoded.roleId;

      if (!roleId) {
        return res.status(403).json({ message: "No role assigned" });
      }

      const rolePerms = await db.query.rolePermissions.findMany({
        where: (rp) => eq(rp.roleId, roleId),
        with: {
          permission: true,
        },
      });

      const userPermissions = rolePerms.map((rp) => rp.permission.name);

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "You do not have permission" });
      }

      next();
    } catch (err) {
      console.error("Permission middleware error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
