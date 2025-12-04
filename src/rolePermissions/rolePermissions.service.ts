import { eq, and, inArray } from "drizzle-orm";
import db from "../Drizzle/db";
import { roles, permissions, rolePermissions, userRoles, employees } from "../Drizzle/schema";

// ASSIGN PERMISSION TO ROLE
export const assignPermissionToRoleService = async (roleId: number, permissionId: number) => {
  // Check if role exists
  const role = await db.query.roles.findFirst({ where: eq(roles.id, roleId) });
  if (!role) throw new Error("Role not found");

  // Check if permission exists
  const permission = await db.query.permissions.findFirst({ where: eq(permissions.id, permissionId) });
  if (!permission) throw new Error("Permission not found");

  // Check if already assigned
  const existing = await db.query.rolePermissions.findFirst({
    where: and(
      eq(rolePermissions.roleId, roleId),
      eq(rolePermissions.permissionId, permissionId)
    ),
  });
  if (existing) throw new Error("Permission already assigned to role");

  await db.insert(rolePermissions).values({ roleId, permissionId });
  return "Permission assigned to role successfully";
};

// GET ALL ROLE PERMISSIONS
export const getRolePermissionsService = async () => {
  return await db.query.rolePermissions.findMany({
    with: { role: true, permission: true },
  });
};

// GET ROLE PERMISSIONS BY ROLE
export const getRolePermissionsByRoleService = async (roleId: number) => {
  return await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, roleId),
    with: { permission: true, role: true },
  });
};

//GET ROLE PERMISSION BY ID
export const getRolePermissionByIdService = async (id: number) => {
  const record = await db.query.rolePermissions.findFirst({
    where: eq(rolePermissions.id, id),
    with: { role: true, permission: true },
  });

  if (!record) throw new Error("Role permission not found");

  return record;
};

// REMOVE PERMISSION FROM ROLE
export const removePermissionFromRoleService = async (roleId: number, permissionId: number) => {
  const deleted = await db.delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      )
    )
    .returning();

  if (deleted.length === 0) throw new Error("Permission not assigned to role");
  return "Permission removed from role successfully";
};

// GET ALL PERMISSIONS OF AN EMPLOYEE THROUGH THEIR ROLES
export const getEmployeePermissionsService = async (employeeId: number) => {
  // Check if employee exists
  const employee = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  if (!employee) throw new Error("Employee not found");

  // Fetch all roles of the employee
  const userRolesList = await db.query.userRoles.findMany({
    where: eq(userRoles.employeeId, employeeId),
    with: { role: true },
  });

  if (userRolesList.length === 0) return []; // No roles assigned

  const roleIds = userRolesList.map(ur => ur.roleId);

  // Fetch all permissions for those roles
  const rolePermissionsList = await db.query.rolePermissions.findMany({
    where: inArray(rolePermissions.roleId, roleIds),
    with: { permission: true },
  });

  // Return unique permissions
  const permissionsSet = new Map<number, typeof permissions.$inferSelect>();
  rolePermissionsList.forEach(rp => {
    if (rp.permission) permissionsSet.set(rp.permission.id, rp.permission);
  });

  return Array.from(permissionsSet.values());
};
