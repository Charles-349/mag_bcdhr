
// import { Request, Response, NextFunction } from "express";
// import { verifyToken } from "../utils/jwt";
// import db from "../Drizzle/db";
// import { employees } from "../Drizzle/schema";

// export const checkPermission = (
//   requiredPermission: string,
//   options: { allowBootstrap?: boolean } = {}
// ) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       //BOOTSTRAP MODE 
//       if (options.allowBootstrap) {
//         const employeesCount = await db.select().from(employees);
//         if (employeesCount.length === 0) return next();
//       }
//       const authHeader = req.headers.authorization;
//       if (!authHeader?.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "Unauthorized: No token" });
//       }

//       let decoded: any;
//       try {
//         decoded = verifyToken(authHeader.split(" ")[1]);
//       } catch {
//         return res.status(401).json({ message: "Invalid or expired token" });
//       }

//       // Attach user to request
//       (req as any).user = decoded;

//       //SUPER ADMIN BYPASS 
//       if (decoded.roles?.includes("super_admin")) {
//         return next();
//       }
//       //ADMIN BYPASS
//       if (decoded.roles?.includes("admin")) {
//         return next();
//       }

//       //PERMISSION CHECK FOR NORMAL USERS
//       const userPermissions: string[] = decoded.permissions || [];

//       if (!userPermissions.includes(requiredPermission)) {
//         return res.status(403).json({ message: "You do not have permission" });
//       }

//       return next();
//     } catch (err) {
//       console.error("Permission middleware error:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
// };

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import db from "../Drizzle/db";
import { employees, departments } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

export const checkPermission = (
  requiredPermission: string,
  options: { allowBootstrap?: boolean } = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // BOOTSTRAP MODE 
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

      // Attach decoded JWT data
      (req as any).user = decoded;

      // SUPER ADMIN & ADMIN BYPASS 
      if (decoded.roles?.includes("super_admin") || decoded.roles?.includes("admin")) {
        return next();
      }

      // Fetch employeeId & companyId if missing
      if (!decoded.employeeId || !decoded.companyId) {
        const employeeRecord = await db
          .select({
            id: employees.id,
            companyId: departments.companyId,
          })
          .from(employees)
          .innerJoin(departments, eq(employees.departmentId, departments.id))
          .where(eq(employees.userId, decoded.id))
          .limit(1);

        if (!employeeRecord || employeeRecord.length === 0) {
          return res.status(401).json({ message: "Unauthorized: No employee found" });
        }

        (req as any).user.employeeId = employeeRecord[0].id;
        (req as any).user.companyId = employeeRecord[0].companyId;
      }

      // PERMISSION CHECK FOR NORMAL USERS
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
