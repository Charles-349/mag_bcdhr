import { eq, ilike, sql } from "drizzle-orm";
import db from "../Drizzle/db";
import { leaveTypes, TILeaveType } from "../Drizzle/schema";

// CREATE LEAVE TYPE
export const createLeaveTypeService = async (payload: TILeaveType) => {
  const inserted = await db.insert(leaveTypes).values({
    ...payload,
  }).returning();

  return inserted[0];
};

// GET ALL LEAVE TYPES (optional search)
export const getLeaveTypesService = async (search?: string) => {
  if (search) {
    return await db.query.leaveTypes.findMany({
      where: ilike(leaveTypes.name, `%${search}%`),
    });
  }

  return await db.query.leaveTypes.findMany();
};

// GET ONE LEAVE TYPE
export const getLeaveTypeByIdService = async (id: number) => {
  const record = await db.query.leaveTypes.findFirst({
    where: eq(leaveTypes.id, id),
  });

  return record;
};

// UPDATE LEAVE TYPE
export const updateLeaveTypeService = async (id: number, payload: Partial<TILeaveType>) => {
  const updated = await db
    .update(leaveTypes)
    .set({
      ...payload,
      updatedAt: sql`NOW()`,
    })
    .where(eq(leaveTypes.id, id))
    .returning();

  return updated[0];
};

// DELETE LEAVE TYPE
export const deleteLeaveTypeService = async (id: number) => {
  const deleted = await db
    .delete(leaveTypes)
    .where(eq(leaveTypes.id, id))
    .returning();

  return deleted[0];
};
