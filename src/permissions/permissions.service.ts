import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { permissions, rolePermissions } from "../Drizzle/schema";

// CREATE PERMISSION
export const addPermissionService = async (data: { 
  name: string; 
  description?: string;
  moduleId: number;
}) => {
  const existing = await db.query.permissions.findFirst({
    where: eq(permissions.name, data.name),
  });

  if (existing) throw new Error("Permission already exists");

  await db.insert(permissions).values({
    name: data.name,
    description: data.description,
    moduleId: data.moduleId,
  });

  return "Permission created successfully";
};

// GET ALL PERMISSIONS
export const getPermissionsService = async () => {
  return await db.query.permissions.findMany({
    with: {
      module: true,
    },
  });
};

// GET PERMISSION BY ID
export const getPermissionByIdService = async (id: number) => {
  return await db.query.permissions.findFirst({
    where: eq(permissions.id, id),
    with: {
      module: true,
    },
  });
};

// UPDATE PERMISSION
export const updatePermissionService = async (
  id: number,
  data: Partial<{ name: string; description?: string; moduleId: number }>
) => {
  const updated = await db
    .update(permissions)
    .set(data)
    .where(eq(permissions.id, id))
    .returning();

  if (updated.length === 0) return null;

  return "Permission updated successfully";
};

// DELETE PERMISSION
export const deletePermissionService = async (id: number) => {
  const deleted = await db
    .delete(permissions)
    .where(eq(permissions.id, id))
    .returning();

  if (deleted.length === 0) return null;

  await db.delete(rolePermissions).where(eq(rolePermissions.permissionId, id));

  return "Permission deleted successfully";
};
