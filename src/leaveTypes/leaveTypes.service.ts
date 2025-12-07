import { and, eq, ilike, sql } from "drizzle-orm";
import db from "../Drizzle/db";
import { leaveTypes, TILeaveType } from "../Drizzle/schema";

// CREATE LEAVE TYPE
export const createLeaveTypeService = async (payload: TILeaveType) => {
  const inserted = await db.insert(leaveTypes).values({
    ...payload,
  }).returning();

  return inserted[0];
};

// GET ALL LEAVE TYPES 
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

//GET LEAVE TYPE BY NAME FOR A COMPANY
export const getLeaveTypeByNameAndCompanyService = async (name: string, companyId: number) => {
  const record = await db.query.leaveTypes.findFirst({
    where: and(
      eq(leaveTypes.name, name),
      eq(leaveTypes.companyId, companyId)
    ),
  });

  return record;
};

//GET LEAVE TYPES BY COMPANY ID
export const getLeaveTypesByCompanyIdService = async (companyId: number) => {
  return await db.query.leaveTypes.findMany({
    where: eq(leaveTypes.companyId, companyId),
  });
};

//GET LEAVE TYPES BY COMPANY ID WITH SEARCH
export const getLeaveTypesByCompanyIdWithSearchService = async (companyId: number, search: string) => {
  return await db.query.leaveTypes.findMany({
    where: and(
      eq(leaveTypes.companyId, companyId),
      ilike(leaveTypes.name, `%${search}%`)
    ),
  });
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
