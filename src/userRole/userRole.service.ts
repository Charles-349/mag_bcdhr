
import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { userRoles, roles, employees } from "../Drizzle/schema";

// CREATE USER ROLE 
export const addUserRoleService = async (employeeId: number, roleId: number) => {
  // check employee exists
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId)
  });
  if (!employee) throw new Error("Employee not found");

  // check role exists
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId)
  });
  if (!role) throw new Error("Role not found");

  // check duplicate
  const exists = await db.query.userRoles.findFirst({
    where: eq(userRoles.employeeId, employeeId)
  });
  if (exists)
    throw new Error("This employee already has a role assigned. Use update.");

  await db.insert(userRoles).values({
    employeeId,
    roleId
  });

  return "Role assigned to employee successfully";
};

// GET ALL USER ROLES
export const getAllUserRolesService = async () => {
  return await db
    .select({
      id: userRoles.id,
      employeeId: userRoles.employeeId,
      roleId: userRoles.roleId,
      employee: employees.firstname,
      lastname: employees.lastname,
      role: roles.name
    })
    .from(userRoles)
    .leftJoin(employees, eq(userRoles.employeeId, employees.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id));
};

// GET USER ROLE BY ID
export const getUserRoleByIdService = async (id: number) => {
  const record = await db
    .select({
      id: userRoles.id,
      employeeId: userRoles.employeeId,
      roleId: userRoles.roleId,
      employee: employees.firstname,
      lastname: employees.lastname,
      role: roles.name
    })
    .from(userRoles)
    .leftJoin(employees, eq(userRoles.employeeId, employees.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.id, id));

  if (!record || record.length === 0) throw new Error("UserRole not found");

  return record[0];
};

// UPDATE USER ROLE
export const updateUserRoleService = async (id: number, roleId: number) => {
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId)
  });
  if (!role) throw new Error("Role not found");

  const updated = await db
    .update(userRoles)
    .set({ roleId })
    .where(eq(userRoles.id, id))
    .returning();

  if (!updated.length) throw new Error("UserRole not found");

  return "User role updated successfully";
};

// DELETE USER ROLE
export const deleteUserRoleService = async (id: number) => {
  const deleted = await db.delete(userRoles).where(eq(userRoles.id, id)).returning();

  if (!deleted.length) throw new Error("UserRole not found");

  return "User role deleted successfully";
};
