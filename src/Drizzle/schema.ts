import { 
  pgEnum, pgTable, serial, varchar, text, integer, timestamp, boolean, date 
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import company from "../company/company.router";


export const EmployeeStatusEnum = pgEnum("employee_status", [
  "active",
  "suspended",
  "terminated",
]);

export const GenderEnum = pgEnum("gender", ["male", "female"]);
export const LeaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled"
]);


export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  address: text("address"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  password: varchar("password", { length: 255 }),
  gender: GenderEnum("gender").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).default(
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  companyId: integer("company_id").references(() => companies.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
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

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  managerId: integer("manager_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  departmentId: integer("department_id")
    .references(() => departments.id, { onDelete: "set null" })
    .default(sql`NULL`),
  reportsTo: integer("reports_to").references((): any => employees.id),
  status: EmployeeStatusEnum("employee_status").default("active"),
  contractType: varchar("contract_type", { length: 100 }),
  jobTitle: varchar("job_title", { length: 255 }),
  dateHired: date("date_hired"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  maxDaysPerYear: integer("max_days_per_year").notNull(),
  requiresApproval: boolean("requires_approval").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

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

export const leaveApprovals = pgTable("leave_approvals", {
  id: serial("id").primaryKey(),
  leaveRequestId: integer("leave_request_id").references(() => leaveRequests.id).notNull(),
  approverId: integer("approver_id").references(() => employees.id).notNull(),
  level: integer("level").notNull().default(1),
  decision: LeaveStatusEnum("decision").default("pending"),
  comment: text("comment"),
  decidedAt: timestamp("decided_at"),
});


export const publicHolidays = pgTable("public_holidays", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hrNotifications = pgTable("hr_notifications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("general"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hrAuditLogs = pgTable("hr_audit_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});



export const usersRelations = relations(users, ({ many, one }) => ({
  roles: many(userRoles),
  employeeProfile: many(employees),
  company: one(companies, { fields: [users.companyId], references: [companies.id] }),
}));

export const departmentsRelations = relations(departments, ({ many, one }) => ({
  employees: many(employees),
  manager: one(employees, {
    fields: [departments.managerId],
    references: [employees.id],
  }),
  company: one(companies, { fields: [departments.companyId], references: [companies.id] }),
}));

export const leaveTypesRelations = relations(leaveTypes, ({ many, one }) => ({
  leaveRequests: many(leaveRequests),
  leaveBalances: many(leaveBalances),
  company: one(companies, { fields: [leaveTypes.companyId], references: [companies.id] }),
}));

export const employeesRelations = relations(employees, ({ many, one }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  department: one(departments, { fields: [employees.departmentId], references: [departments.id] }),
  manager: one(employees, { fields: [employees.reportsTo], references: [employees.id], relationName: "employee_manager" }),
  subordinates: many(employees, { relationName: "employee_manager" }),
  leaveRequests: many(leaveRequests),
  leaveBalances: many(leaveBalances),
  approvals: many(leaveApprovals),
  notifications: many(hrNotifications),
  auditLogs: many(hrAuditLogs),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const rolesRelations = relations(roles, ({ many, one }) => ({
  rolePermissions: many(rolePermissions),
  company: one(companies, { fields: [roles.companyId], references: [companies.id] }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  roles: many(roles),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  module: one(modules, {
    fields: [permissions.moduleId],
    references: [modules.id],
  }),
  rolePermissions: many(rolePermissions),
}));




export type TIUser = typeof users.$inferInsert;
export type TSUser = typeof users.$inferSelect;

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

export type TIUserRole = typeof userRoles.$inferInsert;
export type TSUserRole = typeof userRoles.$inferSelect;

export type TIModule = typeof modules.$inferInsert;
export type TSModule = typeof modules.$inferSelect;

export type TICompany = typeof companies.$inferInsert;
export type TSCompany = typeof companies.$inferSelect;
