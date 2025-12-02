import { eq, ilike } from "drizzle-orm";
import db from "../Drizzle/db";
import { departments, employees, TIDepartment } from "../Drizzle/schema";

// CREATE DEPARTMENT
export const addDepartmentService = async (department: TIDepartment) => {
  // Check if a department with the same name already exists
  const existing = await db.query.departments.findFirst({
    where: eq(departments.name, department.name),
  });

  if (existing) {
    throw new Error(`Department '${department.name}' already exists`);
  }

  await db.insert(departments).values(department);
  return "Department created successfully";
};

// GET ALL DEPARTMENTS
export const getDepartmentsService = async () => {
  return await db.query.departments.findMany({
    with: { manager: true },
  });
};

// GET DEPARTMENT BY ID
export const getDepartmentByIdService = async (id: number) => {
  return await db.query.departments.findFirst({
    where: eq(departments.id, id),
    with: { manager: true, employees: true },
  });
};

// GET DEPARTMENT BY NAME (partial search)
export const getDepartmentByNameService = async (name: string) => {
  const search = `%${name}%`;
  return await db.query.departments.findMany({
    where: ilike(departments.name, search),
    with: { manager: true, employees: true },
  });
};

// UPDATE DEPARTMENT
export const updateDepartmentService = async (id: number, data: Partial<TIDepartment>) => {
  const updated = await db.update(departments).set(data).where(eq(departments.id, id)).returning();
  if (updated.length === 0) return null;
  return "Department updated successfully";
};

// DELETE DEPARTMENT
export const deleteDepartmentService = async (id: number) => {
  const deleted = await db.delete(departments).where(eq(departments.id, id)).returning();
  if (deleted.length === 0) return null;
  return "Department deleted successfully";
};

// GET DEPARTMENT WITH EMPLOYEES
export const getDepartmentWithEmployeesService = async (id: number) => {
  return await db.query.departments.findFirst({
    where: eq(departments.id, id),
    with: { employees: true, manager: true },
  });
};
