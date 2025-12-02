import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { roles, permissions, rolePermissions } from "../Drizzle/schema";

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
    where: eq(rolePermissions.roleId, roleId) && eq(rolePermissions.permissionId, permissionId),
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

// REMOVE PERMISSION FROM ROLE
export const removePermissionFromRoleService = async (roleId: number, permissionId: number) => {
  const deleted = await db.delete(rolePermissions).where(
    eq(rolePermissions.roleId, roleId) && eq(rolePermissions.permissionId, permissionId)
  ).returning();

  if (deleted.length === 0) return null;
  return "Permission removed from role successfully";
};
