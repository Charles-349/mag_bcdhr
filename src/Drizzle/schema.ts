import { 
  pgEnum, pgTable, serial, varchar, text, integer, timestamp, boolean, date 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUMS
export const EmployeeStatusEnum = pgEnum("employee_status", [
  "active",
  "suspended",
  "terminated",
]);

export const GenderEnum = pgEnum("gender", ["male", "female"]);

export const ContractTypeEnum = pgEnum("contract_type", [
  "full_time",
  "part_time",
  "intern",
  "contract",
  "casual",
]);

export const LeaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled"
]);

export const LeaveTypeCategoryEnum = pgEnum("leave_type_category", [
  "annual",
  "sick",
  "maternity",
  "paternity",
  "compassionate",
  "unpaid",
  "study",
]);

//RBAC TABLES
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// DEPARTMENTS
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  managerId: integer("manager_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// EMPLOYEES TABLE 
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").references(() => departments.id),
  reportsTo: integer("reports_to").references((): any => employees.id),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  gender: GenderEnum("gender").notNull(),
  status: EmployeeStatusEnum("employee_status").default("active"),
  contractType: ContractTypeEnum("contract_type").notNull().default("full_time"),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  jobTitle: varchar("job_title", { length: 255 }),
  dateHired: date("date_hired"),
  password: varchar("password", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }).default(
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LEAVE TYPES
export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: LeaveTypeCategoryEnum("leave_type_category").notNull(),
  maxDaysPerYear: integer("max_days_per_year").notNull(),
  requiresApproval: boolean("requires_approval").default(true),
  restrictedToGender: varchar("restricted_to_gender", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// PASSWORD RESET TOKENS
export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// LEAVE BALANCES
export const leaveBalances = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  leaveTypeId: integer("leave_type_id").references(() => leaveTypes.id).notNull(),
  allocatedDays: integer("allocated_days").notNull(),
  usedDays: integer("used_days").default(0),
  remainingDays: integer("remaining_days").notNull(),
  year: integer("year").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LEAVE REQUESTS
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  leaveTypeId: integer("leave_type_id").references(() => leaveTypes.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  includeWeekends: boolean("include_weekends").default(false),
  includeHolidays: boolean("include_holidays").default(false),
  totalDays: integer("total_days").notNull(),
  reason: text("reason").notNull(),
  status: LeaveStatusEnum("leave_status").default("pending"),
  managerComment: text("manager_comment"),
  hrComment: text("hr_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// MULTI-LEVEL APPROVAL WORKFLOW
export const leaveApprovals = pgTable("leave_approvals", {
  id: serial("id").primaryKey(),
  leaveRequestId: integer("leave_request_id").references(() => leaveRequests.id).notNull(),
  approverId: integer("approver_id").references(() => employees.id).notNull(),
  level: integer("level").notNull().default(1),
  decision: LeaveStatusEnum("decision").default("pending"),
  comment: text("comment"),
  decidedAt: timestamp("decided_at"),
});

// HOLIDAYS
export const publicHolidays = pgTable("public_holidays", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// NOTIFICATIONS
export const hrNotifications = pgTable("hr_notifications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("general"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// AUDIT LOGS
export const hrAuditLogs = pgTable("hr_audit_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// RELATIONS
export const rolesRelations = relations(roles, ({ many }) => ({
  employees: many(employees),
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const departmentsRelations = relations(departments, ({ many, one }) => ({
  employees: many(employees),
  manager: one(employees, {
    fields: [departments.managerId],
    references: [employees.id],
  }),
}));

export const employeesRelations = relations(employees, ({ many, one }) => ({
  role: one(roles, { fields: [employees.roleId], references: [roles.id] }),
  department: one(departments, { fields: [employees.departmentId], references: [departments.id] }),
  manager: one(employees, { fields: [employees.reportsTo], references: [employees.id], relationName: "employee_manager" }),
  subordinates: many(employees, { relationName: "employee_manager" }),
  leaveRequests: many(leaveRequests),
  leaveBalances: many(leaveBalances),
  approvals: many(leaveApprovals),
  notifications: many(hrNotifications),
  auditLogs: many(hrAuditLogs),
}));

export const leaveTypesRelations = relations(leaveTypes, ({ many }) => ({
  leaveRequests: many(leaveRequests),
  leaveBalances: many(leaveBalances),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one, many }) => ({
  employee: one(employees, { fields: [leaveRequests.employeeId], references: [employees.id] }),
  leaveType: one(leaveTypes, { fields: [leaveRequests.leaveTypeId], references: [leaveTypes.id] }),
  approvals: many(leaveApprovals),
}));

export const leaveApprovalsRelations = relations(leaveApprovals, ({ one }) => ({
  leaveRequest: one(leaveRequests, { fields: [leaveApprovals.leaveRequestId], references: [leaveRequests.id] }),
  approver: one(employees, { fields: [leaveApprovals.approverId], references: [employees.id] }),
}));

export const leaveBalancesRelations = relations(leaveBalances, ({ one }) => ({
  employee: one(employees, { fields: [leaveBalances.employeeId], references: [employees.id] }),
  leaveType: one(leaveTypes, { fields: [leaveBalances.leaveTypeId], references: [leaveTypes.id] }),
}));

// TYPES
export type TIEmployee = typeof employees.$inferInsert;
export type TSEmployee = typeof employees.$inferSelect;

export type TIDepartment = typeof departments.$inferInsert;
export type TSDepartment = typeof departments.$inferSelect;

export type TILeaveType = typeof leaveTypes.$inferInsert;
export type TSLeaveType = typeof leaveTypes.$inferSelect;

export type TILeaveRequest = typeof leaveRequests.$inferInsert;
export type TSLeaveRequest = typeof leaveRequests.$inferSelect;

export type TILeaveApproval = typeof leaveApprovals.$inferInsert;
export type TSLeaveApproval = typeof leaveApprovals.$inferSelect;

export type TILeaveBalance = typeof leaveBalances.$inferInsert;
export type TSLeaveBalance = typeof leaveBalances.$inferSelect;

export type TIPublicHoliday = typeof publicHolidays.$inferInsert;
export type TSPublicHoliday = typeof publicHolidays.$inferSelect;

export type TINotification = typeof hrNotifications.$inferInsert;
export type TSNotification = typeof hrNotifications.$inferSelect;

export type TIAuditLog = typeof hrAuditLogs.$inferInsert;
export type TSAuditLog = typeof hrAuditLogs.$inferSelect;

export type TIRole = typeof roles.$inferInsert;
export type TSRole = typeof roles.$inferSelect;

export type TIPermission = typeof permissions.$inferInsert;
export type TSPermission = typeof permissions.$inferSelect;

export type TIRolePermission = typeof rolePermissions.$inferInsert;
export type TSRolePermission = typeof rolePermissions.$inferSelect;
