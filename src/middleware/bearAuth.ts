// import { Request, Response, NextFunction } from "express";
// import { verifyToken } from "../utils/jwt";
// import db from "../Drizzle/db";
// import {
//   employees,
//   departments,
//   userRoles,
//   rolePermissions,
//   permissions,
//   roles,
// } from "../Drizzle/schema";
// import { eq, and } from "drizzle-orm";

// export const checkPermission = (
//   requiredPermission: string,
//   options: { allowBootstrap?: boolean } = {}
// ) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       //BOOTSTRAP MODE
//       if (options.allowBootstrap) {
//         const count = await db.select().from(employees);
//         if (count.length === 0) return next();
//       }

//       //TOKEN CHECK
//       const authHeader = req.headers.authorization;

//       if (!authHeader?.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       let decoded: any;

//       try {
//         decoded = verifyToken(authHeader.split(" ")[1]);
//       } catch {
//         return res.status(401).json({ message: "Invalid token" });
//       }

//       // NORMALIZE USER
//       const userId = decoded.id;

//       if (!userId) {
//         return res.status(401).json({ message: "Invalid user" });
//       }

//       // Get employee + company
//       const employee = await db
//         .select({
//           employeeId: employees.id,
//           companyId: departments.companyId,
//         })
//         .from(employees)
//         .innerJoin(departments, eq(employees.departmentId, departments.id))
//         .where(eq(employees.userId, userId))
//         .limit(1);

//       if (!employee.length) {
//         return res.status(401).json({ message: "Employee not found" });
//       }

//       const employeeId = employee[0].employeeId;
//       const companyId = employee[0].companyId;

//       if (!companyId) {
//         return res.status(401).json({ message: "Company not found" });
//       }

//       // Attach normalized user
//       (req as any).user = {
//         id: userId,
//         employeeId,
//         companyId,
//       };
//       //SUPER ADMIN
//       if (decoded.roles?.includes("super_admin")) {
//         return next();
//       }

//       //PERMISSION CHECK
//       const permissionRecord = await db
//         .select({
//           name: permissions.name,
//         })
//         .from(userRoles)
//         .innerJoin(roles, eq(userRoles.roleId, roles.id))
//         .innerJoin(
//           rolePermissions,
//           eq(roles.id, rolePermissions.roleId)
//         )
//         .innerJoin(
//           permissions,
//           eq(rolePermissions.permissionId, permissions.id)
//         )
//         .where(
//           and(
//             eq(userRoles.userId, userId),
//             eq(userRoles.companyId, companyId),
//             eq(permissions.name, requiredPermission)
//           )
//         )
//         .limit(1);

//       if (!permissionRecord.length) {
//         return res.status(403).json({
//           message: "Permission denied",
//         });
//       }

//       return next();
//     } catch (error) {
//       console.error("Permission middleware error:", error);

//       return res.status(500).json({
//         message: "Internal server error",
//       });
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
