import { and, eq, ilike } from "drizzle-orm";
import db from "../Drizzle/db";
import { departments, employees, TIDepartment } from "../Drizzle/schema";

// CREATE DEPARTMENT
// export const addDepartmentService = async (department: TIDepartment) => {
//   // Validate required fields
//   if (!department.companyId) {
//     throw new Error("companyId is required to create a department.");
//   }

//   if (!department.name) {
//     throw new Error("Department name is required.");
//   }

//   // Check if department name already exists in the same company
//   const existing = await db.query.departments.findFirst({
//     where: and(
//       eq(departments.companyId, department.companyId),
//       eq(departments.name, department.name)
//     ),
//   });

//   if (existing) {
//     throw new Error(
//       `Department '${department.name}' already exists under this company.`
//     );
//   }

//   // Insert the department
//   const [created] = await db
//     .insert(departments)
//     .values({
//       companyId: department.companyId,
//       name: department.name,
//       description: department.description ?? null,
//       managerId: department.managerId ?? null,
//     })
//     .returning();

//   return created;
// };

export const addDepartmentService = async (department: TIDepartment) => {
  if (!department.companyId) throw new Error("companyId is required to create a department.");
  if (!department.name) throw new Error("Department name is required.");

  // Check duplicate department
  const existing = await db.query.departments.findFirst({
    where: and(
      eq(departments.companyId, department.companyId),
      eq(departments.name, department.name)
    ),
  });
  if (existing) throw new Error(`Department '${department.name}' already exists under this company.`);

  
  let managerEmployeeId: number | null = null;
  if (department.managerId) {
    const manager = await db.query.employees.findFirst({
      where: eq(employees.id, department.managerId),
    });
    if (!manager) throw new Error("Manager employee not found");
    managerEmployeeId = manager.id; 
  }

  const [created] = await db.insert(departments).values({
    companyId: department.companyId,
    name: department.name,
    description: department.description ?? null,
    managerId: managerEmployeeId,
  }).returning();

  return created;
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

// GET DEPARTMENT BY NAME 
export const getDepartmentByNameService = async (name: string) => {
  const search = `%${name}%`;
  return await db.query.departments.findMany({
    where: ilike(departments.name, search),
    with: { manager: true, employees: true },
  });
};

//GET DEPARTMENTS BY COMPANY ID
export const getDepartmentsByCompanyIdService = async (companyId: number) => {
  return await db.query.departments.findMany({
    where: eq(departments.companyId, companyId),
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
