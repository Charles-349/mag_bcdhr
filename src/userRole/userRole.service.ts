import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { userRoles, roles, users } from "../Drizzle/schema";

// CREATE USER ROLE 
export const addUserRoleService = async (userId: number, roleId: number) => {
  // check user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  if (!user) throw new Error("User not found");

  // check role exists
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId)
  });
  if (!role) throw new Error("Role not found");

  // check duplicate
  const exists = await db.query.userRoles.findFirst({
    where: eq(userRoles.userId, userId)
  });
  if (exists)
    throw new Error("This user already has a role assigned. Use update.");

  await db.insert(userRoles).values({
    userId,
    roleId
  });

  return "Role assigned to user successfully";
};

// GET ALL USER ROLES
export const getAllUserRolesService = async () => {
  return await db
    .select({
      id: userRoles.id,
      userId: userRoles.userId,
      roleId: userRoles.roleId,
      firstname: users.firstname,
      lastname: users.lastname,
      email: users.email,
      role: roles.name
    })
    .from(userRoles)
    .leftJoin(users, eq(userRoles.userId, users.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id));
};

// GET USER ROLE BY ID
export const getUserRoleByIdService = async (id: number) => {
  const record = await db
    .select({
      id: userRoles.id,
      userId: userRoles.userId,
      roleId: userRoles.roleId,
      firstname: users.firstname,
      lastname: users.lastname,
      email: users.email,
      role: roles.name
    })
    .from(userRoles)
    .leftJoin(users, eq(userRoles.userId, users.id))
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
