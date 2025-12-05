import { eq, ilike } from "drizzle-orm";
import db from "../Drizzle/db";
import { companies, TICompany } from "../Drizzle/schema";

// CREATE COMPANY
export const addCompanyService = async (company: TICompany) => {
  const inserted = await db.insert(companies).values(company).returning();
  return inserted[0];
};

// GET ALL COMPANIES
export const getCompaniesService = async () => {
  return await db.query.companies.findMany();
};

// GET COMPANY BY ID
export const getCompanyByIdService = async (id: number) => {
  return await db.query.companies.findFirst({
    where: eq(companies.id, id),
  });
};

// GET COMPANY BY NAME 
export const getCompanyByNameService = async (name: string) => {
  const search = `%${name}%`;
  return await db.query.companies.findMany({
    where: ilike(companies.name, search),
  });
};

// UPDATE COMPANY
export const updateCompanyService = async (id: number, data: Partial<TICompany>) => {
  const updated = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
  if (updated.length === 0) return null;
  return "Company updated successfully";
};

// DELETE COMPANY
export const deleteCompanyService = async (id: number) => {
  const deleted = await db.delete(companies).where(eq(companies.id, id)).returning();
  if (deleted.length === 0) return null;
  return "Company permanently deleted successfully";
};
