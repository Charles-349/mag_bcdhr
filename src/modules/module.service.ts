import { eq, ilike, sql } from "drizzle-orm";
import db from "../Drizzle/db";
import { modules, TIRole, TSRole } from "../Drizzle/schema";

export type TIModule = typeof modules.$inferInsert;
export type TSModule = typeof modules.$inferSelect;

//CREATE MODULE
export const createModuleService = async (data: TIModule) => {
  if (!data.name) throw new Error("Module name is required");

  const exists = await db.query.modules.findFirst({
    where: eq(modules.name, data.name)
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


//GET ALL MODULES
export const getAllModulesService = async (search?: string) => {
  if (search) {
    return await db
      .select()
      .from(modules)
      .where(ilike(modules.name, `%${search}%`));
  }

  return await db.select().from(modules);
};

// GET MODULE BY ID
export const getModuleByIdService = async (id: number) => {
  const record = await db.query.modules.findFirst({
    where: eq(modules.id, id)
  });

  if (!record) throw new Error("Module not found");

  return record;
};

// UPDATE MODULE
export const updateModuleService = async (id: number, data: Partial<TIModule>) => {
  const exists = await db.query.modules.findFirst({
    where: eq(modules.id, id)
  });

  if (!exists) throw new Error("Module not found");

  const updated = await db
    .update(modules)
    .set({
      name: data.name ?? exists.name,
      description: data.description ?? exists.description,
    })
    .where(eq(modules.id, id))
    .returning();

  return updated[0];
};

//DELETE MODULE
export const deleteModuleService = async (id: number) => {
  const exists = await db.query.modules.findFirst({
    where: eq(modules.id, id)
  });

  if (!exists) throw new Error("Module not found");

  await db.delete(modules).where(eq(modules.id, id));

  return "Module deleted successfully";
};
