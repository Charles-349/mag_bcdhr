import { eq, and } from "drizzle-orm";
import db from "../Drizzle/db";
import {
  leaveBalances,
  TILeaveBalance,
} from "../Drizzle/schema";

// CREATE leave balance 
export const createLeaveBalanceService = async (
  data: TILeaveBalance
) => {
  const created = await db
    .insert(leaveBalances)
    .values(data)
    .returning();

  return created[0];
};

// GET leave balance by ID
export const getLeaveBalanceByIdForCompanyService = async (
  balanceId: number,
  companyId: number
) => {
  return db.query.leaveBalances.findFirst({
    where: and(
      eq(leaveBalances.id, balanceId),
      eq(leaveBalances.employeeId, companyId)
    ),
    with: {
      leaveType: true,
      employee: {
        with: {
          user: true,
        },
      },
    },
  });
};

// GET leave balances by employee & year
export const getLeaveBalancesByEmployeeService = async (
  employeeId: number,
  year: number
) => {
  return db.query.leaveBalances.findMany({
    where: and(
      eq(leaveBalances.employeeId, employeeId),
      eq(leaveBalances.year, year)
    ),
    with: {
      leaveType: true,
    },
  });
};

// UPDATE leave balance
export const updateLeaveBalanceService = async (
  id: number,
  data: Partial<TILeaveBalance>
) => {
  const updated = await db
    .update(leaveBalances)
    .set(data)
    .where(eq(leaveBalances.id, id))
    .returning();

  return updated.length ? updated[0] : null;
};

// DELETE leave balance
export const deleteLeaveBalanceService = async (id: number) => {
  const deleted = await db
    .delete(leaveBalances)
    .where(eq(leaveBalances.id, id))
    .returning();

  return deleted.length ? deleted[0] : null;
};
