// import db from "../Drizzle/db";
// import { userRoles, rolePermissions, permissions, roles } from "../Drizzle/schema";
// import { eq, and } from "drizzle-orm";

// //Checks if an employee has a specific permission within a company

// export const hasPermission = async (
//   employeeId: number,
//   permissionName: string,
//   companyId: number
// ): Promise<boolean> => {
//   // Get user roles
//   const permissionRecord = await db
//     .select({ name: permissions.name })
//     .from(userRoles)
//     .innerJoin(roles, eq(userRoles.roleId, roles.id))
//     .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
//     .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
//     .where(
//       and(
//         eq(userRoles.userId, employeeId),
//         eq(userRoles.companyId, companyId),
//         eq(permissions.name, permissionName)
//       )
//     )
//     .limit(1);

//   return permissionRecord.length > 0;
// };
