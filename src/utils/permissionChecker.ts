
// import db from "../Drizzle/db";
// import { employees, roles, rolePermissions, permissions } from "../Drizzle/schema";
// import { eq } from "drizzle-orm";

// /**
//  * Checks if an employee has a specific permission.
//  * @param employeeId - ID of the employee
//  * @param permissionName - Name of the permission to check
//  * @returns boolean - true if employee has permission, false otherwise
//  */
// export const checkEmployeePermission = async (
//   employeeId: number,
//   permissionName: string
// ): Promise<boolean> => {
//   // Get employee with role
//   const employee = await db.query.employees.findFirst({
//     where: eq(employees.id, employeeId),
//     with: { role: { with: { permissions: true } } },
//   });

//   if (!employee || !employee.role) return false;

//   // Find the permission record 
//   let permissionRecord = await db.query.permissions.findFirst({
//     where: eq(permissions.name, permissionName),
//   });

//   if (!permissionRecord) {
//     const allPermissions = await db.query.permissions.findMany();
//     permissionRecord = allPermissions.find(
//       (p) => p.name.toLowerCase() === permissionName.toLowerCase()
//     );
//   }

//   if (!permissionRecord) return false;

//   // Check if any of the role's permissions reference the permission id
//   const hasPermission = employee.role.permissions.some(
//     (perm) => perm.permissionId === permissionRecord!.id
//   );

//   return hasPermission;
// };
