import db from "../Drizzle/db";
import { employees, leaveTypes, leaveBalances } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

export const initializeLeaveBalancesForYear = async (year: number) => {
  // Fetch all employees with their company
  const allEmployees = await db.query.employees.findMany({
    with: { user: true }, 
  });

  console.log(`Found ${allEmployees.length} employees`);

  for (const emp of allEmployees) {
    const companyId = emp.user.companyId;
    if (!companyId) continue;

    // Fetch leave types for the employee's company
    const companyLeaveTypes = await db.query.leaveTypes.findMany({
      where: eq(leaveTypes.companyId, companyId),
    });

    if (companyLeaveTypes.length === 0) {
      console.warn(`No leave types configured for company ${companyId}`);
      continue;
    }

    // Prepare balances for this employee
    const balancesToInsert = companyLeaveTypes.map((lt) => ({
      employeeId: emp.id,
      leaveTypeId: lt.id,
      allocatedDays: lt.maxDaysPerYear,
      usedDays: 0,
      remainingDays: lt.maxDaysPerYear,
      year,
    }));

    // Insert balances, ignoring duplicates
    for (const balance of balancesToInsert) {
      await db.insert(leaveBalances)
        .values(balance)
        .onConflictDoNothing(); // avoid duplicate error if balance exists
    }

    console.log(`Initialized leave balances for employee ${emp.id} (${companyLeaveTypes.length} leave types)`);
  }

  console.log(`Leave balance initialization for year ${year} completed.`);
};
