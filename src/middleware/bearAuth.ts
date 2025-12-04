// import Jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
// import db from "../Drizzle/db";
// import { employees, permissions, rolePermissions } from "../Drizzle/schema";
// import { eq } from "drizzle-orm";

// export const checkPermission = (
//   requiredPermission: string,
//   options: { allowBootstrap?: boolean } = {}
// ) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Bootstrap allowed ONLY if system has no employees
//       if (options.allowBootstrap) {
//         const employeesCount = await db.select().from(employees);
//         if (employeesCount.length === 0) {
//           return next();
//         }
//       }

//       // Token required after bootstrap
//       const authHeader = req.headers.authorization;
//       if (!authHeader?.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "Unauthorized: No token" });
//       }

//       const token = authHeader.split(" ")[1];

//       let decoded: any;
//       try {
//         decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY!);
//       } catch {
//         return res.status(401).json({ message: "Invalid or expired token" });
//       }

//       (req as any).user = decoded;

//       // Must have role
//       const roleId = decoded.roleId;
//       if (!roleId) {
//         return res.status(403).json({ message: "No role assigned" });
//       }

//       // Check if requiredPermission exists in DB
//       const permExists = await db
//         .select()
//         .from(permissions)
//         .where(eq(permissions.name, requiredPermission));

//       if (permExists.length === 0) {
//         return res.status(400).json({
//           message: `Permission '${requiredPermission}' does not exist`,
//         });
//       }

//       // Fetch user role permissions
//       const rolePerms = await db.query.rolePermissions.findMany({
//         where: (rp) => eq(rp.roleId, roleId),
//         with: {
//           permission: true,
//         },
//       });

//       const userPermissions = rolePerms.map((rp) => rp.permission.name);

//       // Check access
//       if (!userPermissions.includes(requiredPermission)) {
//         return res.status(403).json({ message: "You do not have permission" });
//       }

//       next();
//     } catch (err) {
//       console.error("Permission middleware error:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
// };
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import db from "../Drizzle/db";
import { employees } from "../Drizzle/schema";

export const checkPermission = (
  requiredPermission: string,
  options: { allowBootstrap?: boolean } = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //BOOTSTRAP MODE 
      if (options.allowBootstrap) {
        const employeesCount = await db.select().from(employees);
        if (employeesCount.length === 0) return next();
      }
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token" });
      }

      let decoded: any;
      try {
        decoded = verifyToken(authHeader.split(" ")[1]);
      } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Attach user to request
      (req as any).user = decoded;

      //SUPER ADMIN BYPASS 
      if (decoded.roles?.includes("super_admin")) {
        return next();
      }

      //PERMISSION CHECK FOR NORMAL USERS
      const userPermissions: string[] = decoded.permissions || [];

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "You do not have permission" });
      }

      return next();
    } catch (err) {
      console.error("Permission middleware error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
