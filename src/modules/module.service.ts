import { eq, ilike, sql } from "drizzle-orm";
import db from "../Drizzle/db";
import { modules, TIModule, TSModule } from "../Drizzle/schema";

// CREATE MODULE
export const createModuleService = async (data: TIModule) => {
  if (!data.name) throw new Error("Module name is required");

  const exists = await db.query.modules.findFirst({
    where: eq(modules.name, data.name),
  });

  if (exists) throw new Error("Module with this name already exists");

  const inserted = await db.insert(modules)
    .values({
      name: data.name,
      description: data.description || "",
    })
    .returning();

  return inserted[0];
};

// GET ALL MODULES (with optional search)
export const getAllModulesService = async (search?: string) => {
  if (search) {
    return await db.select().from(modules)
      .where(ilike(modules.name, `%${search}%`));
  }
  return await db.select().from(modules);
};

// GET MODULE BY ID
export const getModuleByIdService = async (id: number) => {
  const record = await db.query.modules.findFirst({
    where: eq(modules.id, id),
  });

  if (!record) throw new Error("Module not found");

  return record;
};

// UPDATE MODULE
export const updateModuleService = async (id: number, data: Partial<TIModule>) => {
  const exists = await db.query.modules.findFirst({
    where: eq(modules.id, id),
  });

  if (!exists) throw new Error("Module not found");

  // Check if updating name and the new name already exists
  if (data.name && data.name !== exists.name) {
    const duplicate = await db.query.modules.findFirst({
      where: eq(modules.name, data.name),
    });
    if (duplicate) throw new Error("Another module with this name already exists");
  }

  const updated = await db.update(modules)
    .set({
      name: data.name ?? exists.name,
      description: data.description ?? exists.description,
    })
    .where(eq(modules.id, id))
    .returning();

  return updated[0];
};

// DELETE MODULE
export const deleteModuleService = async (id: number) => {
  const exists = await db.query.modules.findFirst({
    where: eq(modules.id, id),
  });

  if (!exists) throw new Error("Module not found");

  await db.delete(modules).where(eq(modules.id, id));

  return "Module deleted successfully";
};

//GET MODULES WITH PERMISSIONS
export const getModulesWithPermissionsService = async () => {
  const records = await db.query.modules.findMany({
    with: {
      permissions: true,
    },
  });

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    description: record.description,
    permissions: record.permissions || [],
  }));
};

//GET A MODULE AND ITS PERMISSIONS BY MODULE ID
export const getModuleWithPermissionsByIdService = async (id: number) => {
  const record = await db.query.modules.findFirst({
    where: eq(modules.id, id),
    with: {
      permissions: true,
    },
  });

  if (!record) throw new Error("Module not found");

  return {
    id: record.id,
    name: record.name,
    description: record.description,
    permissions: record.permissions || [],
  };
};

// FETCH ALL MODULES WITH PERMISSIONS
export const getAllModulesWithPermissionsService = async () => {
  // Fetch modules along with permissions
  const modulesWithPermissions = await db.query.modules.findMany({
    with: {
      permissions: true,
    },
  });

  // Format response exactly
  return modulesWithPermissions.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    createdAt: m.createdAt,
    permissions: (m.permissions || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt,
    })),
  }));
};

