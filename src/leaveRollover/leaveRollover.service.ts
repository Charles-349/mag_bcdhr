import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import {
  leaveBalances,
  leaveTypes,
  TSLeaveBalance,
  TSLeaveType,
} from "../Drizzle/schema";

type LeaveBalanceWithType = TSLeaveBalance & {
  leaveType: TSLeaveType;
};

export const runLeaveYearRollover = async () => {
  const previousYear = new Date().getFullYear() - 1;
  const nextYear = previousYear + 1;

  console.log(`Running leave rollover: ${previousYear} → ${nextYear}`);

  const balances = await db.query.leaveBalances.findMany({
    where: eq(leaveBalances.year, previousYear),
    with: {
      leaveType: true,
    },
  }) as LeaveBalanceWithType[];

  if (balances.length === 0) {
    console.log("ℹNo balances found to rollover");
    return;
  }

  for (const balance of balances) {
    const MAX_ROLLOVER_DAYS = 10; 

    const rolloverDays = Math.min(
      balance.remainingDays,
      MAX_ROLLOVER_DAYS
    );

    const newAllocation =
      balance.leaveType.maxDaysPerYear + rolloverDays;

    await db.insert(leaveBalances).values({
      employeeId: balance.employeeId,
      leaveTypeId: balance.leaveTypeId,
      allocatedDays: newAllocation,
      usedDays: 0,
      remainingDays: newAllocation,
      year: nextYear,
      updatedAt: new Date(),
    }).onConflictDoNothing();
  }

  console.log("Leave rollover completed successfully");
};
