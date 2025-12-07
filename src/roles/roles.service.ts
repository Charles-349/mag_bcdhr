import { eq, and } from "drizzle-orm";
import db from "../Drizzle/db";
import { roles, permissions, rolePermissions, TIEmployee } from "../Drizzle/schema";

// CREATE ROLE
export const addRoleService = async (data: { name: string; description?: string; companyId: number }) => {
  const existing = await db.query.roles.findFirst({ 
    where: and(eq(roles.name, data.name), eq(roles.companyId, data.companyId))
  });
  if (existing) throw new Error("Role already exists");
  await db.insert(roles).values(data);
  return "Role created successfully";
};

// GET ALL ROLES
export const getRolesService = async () => {
  return await db.query.roles.findMany({
    with: { rolePermissions: { with: { permission: true } } },
  });
};

// GET ROLE BY ID
export const getRoleByIdService = async (id: number) => {
  return await db.query.roles.findFirst({
    where: eq(roles.id, id),
    with: { rolePermissions: { with: { permission: true } } },
  });
};

//GET ROLE BY NAME
export const getRoleByNameService = async (name: string, companyId: number) => {
  return await db.query.roles.findFirst({
    where: and(eq(roles.name, name), eq(roles.companyId, companyId)),
    with: { rolePermissions: { with: { permission: true } } },
  });
};

//GET ROLE BY COMPANY ID
export const getRolesByCompanyIdService = async (companyId: number) => {
  return await db.query.roles.findMany({
    where: eq(roles.companyId, companyId),
    with: { rolePermissions: { with: { permission: true } } },
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
  // Remove role-permission links
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
  // TODO: optionally remove user-role links if needed
  const deleted = await db.delete(roles).where(eq(roles.id, id)).returning();
  if (deleted.length === 0) return null;
  return "Role deleted successfully";
};

// ASSIGN PERMISSIONS TO ROLE
export const assignPermissionsService = async (roleId: number, permissionIds: number[]) => {
  const values = [];
  for (const permissionId of permissionIds) {
    const existing = await db.query.rolePermissions.findFirst({
      where: and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId))
    });
    if (!existing) values.push({ roleId, permissionId });
  }
  if (values.length > 0) await db.insert(rolePermissions).values(values);
  return "Permissions assigned successfully";
};

// GET ROLE PERMISSIONS
export const getRolePermissionsService = async (roleId: number) => {
  return await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, roleId),
    with: { permission: true },
  });
};
