import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { roles, permissions, rolePermissions, TIEmployee } from "../Drizzle/schema";

// CREATE ROLE
export const addRoleService = async (data: { name: string; description?: string }) => {
  const existing = await db.query.roles.findFirst({ where: eq(roles.name, data.name) });
  if (existing) throw new Error("Role already exists");
  await db.insert(roles).values(data);
  return "Role created successfully";
};

// GET ALL ROLES
export const getRolesService = async () => {
  return await db.query.roles.findMany({
    with: { permissions: { with: { permission: true } } },
  });
};

// GET ROLE BY ID
export const getRoleByIdService = async (id: number) => {
  return await db.query.roles.findFirst({
    where: eq(roles.id, id),
    with: { permissions: { with: { permission: true } } },
  });
};

// UPDATE ROLE
export const updateRoleService = async (id: number, data: Partial<{ name: string; description?: string }>) => {
  const updated = await db.update(roles).set(data).where(eq(roles.id, id)).returning();
  if (updated.length === 0) return null;
  return "Role updated successfully";
};

// DELETE ROLE
export const deleteRoleService = async (id: number) => {
  const deleted = await db.delete(roles).where(eq(roles.id, id)).returning();
  if (deleted.length === 0) return null;
  return "Role deleted successfully";
};

// ASSIGN PERMISSIONS TO ROLE
export const assignPermissionsService = async (roleId: number, permissionIds: number[]) => {
  for (const permissionId of permissionIds) {
    await db.insert(rolePermissions).values({ roleId, permissionId });
  }
  return "Permissions assigned successfully";
};

// GET ROLE PERMISSIONS
export const getRolePermissionsService = async (roleId: number) => {
  return await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, roleId),
    with: { permission: true },
  });
};
