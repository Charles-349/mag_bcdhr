import { and, eq, sql, desc, lte, or, gte, not, inArray } from "drizzle-orm";
import db from "../Drizzle/db";
import {
  leaveRequests,
  TILeaveRequest,
  employees,
  leaveTypes,
  leaveApprovals,
  leaveBalances,
  hrNotifications,
  departments,
  users,
} from "../Drizzle/schema";

// Helper function to send notification
const sendNotification = async (
  employeeId: number,
  message: string,
  type: string = "leave"
) => {
  await db.insert(hrNotifications).values({
    employeeId,
    message,
    type,
    isRead: false,
    createdAt: new Date(),
  });
};

export type LeaveRequestWithEmployee = TILeaveRequest & {
  employee: {
    id: number;
    user: {
      id: number;
      companyId: number;
      gender: "male" | "female";
    };
  };
};

export const addLeaveRequestService = async (
  leaveRequest: Partial<TILeaveRequest>,
  applyingEmployeeId: number
) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, applyingEmployeeId),
    with: { user: true },
  });
  if (!employee) throw new Error("Applying employee not found");

  const leaveType = await db.query.leaveTypes.findFirst({
    where: eq(leaveTypes.id, leaveRequest.leaveTypeId!),
  });
  if (!leaveType) throw new Error("Leave type not found");

  if (leaveType.companyId !== employee.user.companyId) {
    throw new Error("Cannot apply leave type from another company");
  }

  const lowerName = leaveType.name.toLowerCase();
  if (lowerName.includes("maternity") && employee.user.gender !== "female") {
    throw new Error("Only female employees can apply for maternity leave");
  }
  if (lowerName.includes("paternity") && employee.user.gender !== "male") {
    throw new Error("Only male employees can apply for paternity leave");
  }

  const currentYear = new Date().getFullYear();

  // --- Check leave balance ---
  let balance = await db.query.leaveBalances.findFirst({
    where: and(
      eq(leaveBalances.employeeId, employee.id),
      eq(leaveBalances.leaveTypeId, leaveType.id),
      eq(leaveBalances.year, currentYear)
    ),
  });

  // --- Initialize balance if missing ---
  if (!balance) {
    console.log(`Initializing leave balance for employee ${employee.id} for year ${currentYear}`);
    const [newBalance] = await db.insert(leaveBalances).values({
      employeeId: employee.id,
      leaveTypeId: leaveType.id,
      allocatedDays: leaveType.maxDaysPerYear,
      usedDays: 0,
      remainingDays: leaveType.maxDaysPerYear,
      year: currentYear,
    }).returning();
    balance = newBalance;
  }

  //Prevent overlapping leave requests
  const startDate = new Date(leaveRequest.startDate!).toISOString().split('T')[0];
  const endDate = new Date(leaveRequest.endDate!).toISOString().split('T')[0];

  const overlappingLeaves = await db.query.leaveRequests.findMany({
    where: and(
      eq(leaveRequests.employeeId, employee.id),
      or(
        and(
          lte(leaveRequests.startDate, startDate),
          gte(leaveRequests.endDate, startDate)
        ),
        and(
          lte(leaveRequests.startDate, endDate),
          gte(leaveRequests.endDate, endDate)
        ),
        and(
          gte(leaveRequests.startDate, startDate),
          lte(leaveRequests.endDate, endDate)
        )
      ),
      not(eq(leaveRequests.status, "rejected")) // ignore rejected leaves
    ),
  });

  if (overlappingLeaves.length > 0) {
    throw new Error(
      "You already have a leave request that overlaps with these dates"
    );
  }

  // Insert leave request
  const valuesToInsert: TILeaveRequest = {
    employeeId: employee.id,
    leaveTypeId: leaveType.id,
    startDate: leaveRequest.startDate!,
    endDate: leaveRequest.endDate!,
    approvingDepartmentId: leaveRequest.approvingDepartmentId!,
    totalDays: leaveRequest.totalDays ?? null,
    reason: leaveRequest.reason!,
    proofDocument: leaveRequest.proofDocument ?? null,
    status: "pending",
    managerComment: null,
    hrComment: null,
  };

  const [created] = await db.insert(leaveRequests).values(valuesToInsert).returning();

  const start = new Date(created.startDate).toDateString();
  const end = new Date(created.endDate).toDateString();

  // Notify department manager
  const department = await db.query.departments.findFirst({
    where: eq(departments.id, leaveRequest.approvingDepartmentId!),
  });

  if (department?.managerId) {
    await sendNotification(
      department.managerId,
      `A new leave request from employee ${employee.id} from ${start} to ${end} requires your approval.`
    );
  }

  return created;
};

export const getLeaveRequestsService = async () => {
  return await db.query.leaveRequests.findMany({
    columns: {
      proofDocument: true,
      reason: true,
      totalDays: true,
      startDate: true,
      endDate: true,
      status: true,
      id: true,
      employeeId: true,
      leaveTypeId: true,
      approvingDepartmentId: true,
      createdAt: true,
      updatedAt: true,
    },
    with: { employee: { with: { user: true } }, leaveType: true },
  });
};

export const getLeaveRequestByIdService = async (id: number) => {
  return await db.query.leaveRequests.findFirst({
    where: eq(leaveRequests.id, id),
    columns: {
      proofDocument: true,
      reason: true,
      totalDays: true,
      startDate: true,
      endDate: true,
      status: true,
      id: true,
      employeeId: true,
      leaveTypeId: true,
      approvingDepartmentId: true,
      createdAt: true,
    },
    with: { employee: { with: { user: true } }, leaveType: true },
  });
};

export const getLeaveRequestsByEmployeeIdService = async (employeeId: number) => {
  return await db.query.leaveRequests.findMany({
    where: eq(leaveRequests.employeeId, employeeId),
    columns: {
      proofDocument: true,
      reason: true,
      totalDays: true,
      startDate: true,
      endDate: true,
      status: true,
      id: true,
      employeeId: true,
      leaveTypeId: true,
      approvingDepartmentId: true,
      createdAt: true,
    },
    with: { leaveType: true },
  });
};

export const getLeaveRequestsByCompanyIdService = async (companyId: number) => {
  return await db.query.leaveRequests.findMany({
    columns: {
      proofDocument: true,
      reason: true,
      totalDays: true,
      startDate: true,
      endDate: true,
      status: true,
      id: true,
      employeeId: true,
      leaveTypeId: true,
      approvingDepartmentId: true,
      createdAt: true,
    },
    with: { employee: { with: { user: true } }, leaveType: true },
    where: sql`${leaveRequests.employeeId} IN (SELECT e.id FROM employees e JOIN users u ON e.user_id = u.id WHERE u.company_id = ${companyId})`,
  });
};

export const updateLeaveRequestService = async (
  id: number,
  data: Partial<TILeaveRequest>
) => {
  const existing = await db.query.leaveRequests.findFirst({
    where: eq(leaveRequests.id, id),
    with: {
      employee: {
        with: {
          user: true
        }
      }
    }
  }) as {
    employee: {
      id: number;
      user: { companyId: number };
    };
    leaveTypeId: number;
  } | null;   
  

  if (!existing) return null;

  // Prevent changing employee
  if ((data as any).employeeId && (data as any).employeeId !== existing.employee.id) {
    throw new Error("Cannot change the applying employee");
  }

  // Leave type changing
  if (data.leaveTypeId && data.leaveTypeId !== existing.leaveTypeId) {
    const leaveType = await db.query.leaveTypes.findFirst({
      where: eq(leaveTypes.id, data.leaveTypeId),
    });

    if (!leaveType) throw new Error("Leave type not found");

    if (leaveType.companyId !== existing.employee.user.companyId) {
      throw new Error("Cannot apply leave type from another company");
    }
  }

  const updatedData: Partial<TILeaveRequest> = { ...data };

  if (!Object.prototype.hasOwnProperty.call(data, "totalDays")) {
    delete (updatedData as any).totalDays;
  }

  const updated = await db.update(leaveRequests)
    .set(updatedData)
    .where(eq(leaveRequests.id, id))
    .returning();

  if (updated.length === 0) return null;

  return "Leave request updated successfully";
};


export const deleteLeaveRequestService = async (id: number) => {
  const deleted = await db.delete(leaveRequests)
    .where(eq(leaveRequests.id, id))
    .returning();

  if (deleted.length === 0) return null;

  return "Leave request deleted successfully";
};

export const decideLeaveRequestService = async (
  leaveRequestId: number,
  approverEmployeeId: number,
  action: "approve" | "reject" | "comment",
  comment?: string,
  totalDays?: number
) => {
  const leave = await db.query.leaveRequests.findFirst({
    where: eq(leaveRequests.id, leaveRequestId),
    with: { employee: true },
  });

  if (!leave) throw new Error("Leave request not found");

  const department = await db.query.departments.findFirst({
    where: eq(departments.id, leave.approvingDepartmentId),
  });

  if (!department) throw new Error("Approving department not found");

  const isManager = Number(department.managerId) === Number(approverEmployeeId);
  const currentYear = new Date().getFullYear();

  // Manager comment
  if (isManager && action === "comment") {
    await db.update(leaveRequests)
      .set({
        managerComment: comment ?? null,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, leaveRequestId));

    return { message: "Manager comment recorded, awaiting HR decision" };
  }

  // HR actions
  if (!leave.managerComment) {
    throw new Error("Waiting for manager comment");
  }

  if (action === "approve" || action === "reject") {
    // Block double approval or reject
    if ((leave.status === "approved" && action === "approve") ||
        (leave.status === "rejected" && action === "reject")) {
      throw new Error(`Leave already ${action}d`);
    }

    const days = Number(totalDays ?? leave.totalDays ?? 0);

    const leaveBalance = await db.query.leaveBalances.findFirst({
      where: and(
        eq(leaveBalances.employeeId, leave.employee.id),
        eq(leaveBalances.leaveTypeId, leave.leaveTypeId),
        eq(leaveBalances.year, currentYear)
      ),
    });

    if (!leaveBalance) throw new Error("Leave balance not found");

    // Deduct or revert leave balance
    if (action === "approve") {
      if (leaveBalance.remainingDays < days) throw new Error("Insufficient leave balance");

      await db.update(leaveBalances)
        .set({
          usedDays: (leaveBalance.usedDays ?? 0) + days,
          remainingDays: (leaveBalance.remainingDays ?? 0) - days,
          updatedAt: new Date(),
        })
        .where(eq(leaveBalances.id, leaveBalance.id));
    }

    if (action === "reject" && leave.status === "approved") {
      await db.update(leaveBalances)
        .set({
          usedDays: Math.max((leaveBalance.usedDays ?? 0) - days, 0),
          remainingDays: (leaveBalance.remainingDays ?? 0) + days,
          updatedAt: new Date(),
        })
        .where(eq(leaveBalances.id, leaveBalance.id));
    }

    //Upsert HR approval/rejection
    const existingApproval = await db.query.leaveApprovals.findFirst({
      where: and(
        eq(leaveApprovals.leaveRequestId, leaveRequestId),
        eq(leaveApprovals.approverId, approverEmployeeId)
      ),
    });

    if (existingApproval) {
      // Update existing record
      await db.update(leaveApprovals)
        .set({
          decision: action === "approve" ? "approved" : "rejected",
          comment: comment ?? existingApproval.comment,
          decidedAt: new Date(),
        })
        .where(eq(leaveApprovals.id, existingApproval.id));
    } else {
      // Insert new record
      const lastApproval = await db.query.leaveApprovals.findMany({
        where: eq(leaveApprovals.leaveRequestId, leaveRequestId),
        orderBy: [desc(leaveApprovals.level)],
        limit: 1,
      });

      const nextLevel = lastApproval.length ? lastApproval[0].level + 1 : 1;

      await db.insert(leaveApprovals).values({
        leaveRequestId,
        approverId: approverEmployeeId,
        level: nextLevel,
        decision: action === "approve" ? "approved" : "rejected",
        comment: comment ?? null,
        decidedAt: new Date(),
      });
    }
    const newStatus = action === "approve" ? "approved" : "rejected";

    await db.update(leaveRequests)
      .set({
        status: newStatus,
        hrComment: comment ?? null,
        totalDays: days,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, leaveRequestId));

    // Notify employee
    const start = new Date(leave.startDate).toDateString();
    const end = new Date(leave.endDate).toDateString();

    await sendNotification(
      leave.employee.id,
      action === "approve"
        ? `Your leave request from ${start} to ${end} has been approved.`
        : `Your leave request from ${start} to ${end} has been rejected.`
    );

    return { message: `Leave ${newStatus} successfully` };
  }

  throw new Error("Invalid action");
};

// GET LEAVE REQUESTS FOR MANAGER 
export const getLeaveRequestsForApprovingDepartmentManagerService = async (
  managerEmployeeId: number,
  companyId: number
) => {
  return await db
    .select({
      request: leaveRequests,
      department: departments,
      employee: employees,
      user: users,
      leaveType: leaveTypes,
    })
    .from(leaveRequests)

    // Join department
    .innerJoin(
      departments,
      eq(leaveRequests.approvingDepartmentId, departments.id)
    )

    // Join employee
    .innerJoin(
      employees,
      eq(leaveRequests.employeeId, employees.id)
    )

    // Join user
    .innerJoin(
      users,
      eq(employees.userId, users.id)
    )

    // Join leave type
    .innerJoin(
      leaveTypes,
      eq(leaveRequests.leaveTypeId, leaveTypes.id)
    )

    .where(
      and(
        eq(leaveRequests.status, "pending"),
        eq(departments.managerId, managerEmployeeId),
        eq(departments.companyId, companyId)
      )
    )

    .orderBy(desc(leaveRequests.createdAt));
};
