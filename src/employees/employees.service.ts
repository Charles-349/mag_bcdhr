import { eq, sql, ilike } from "drizzle-orm";
import db from "../Drizzle/db";
import { employees, departments, roles, rolePermissions, permissions, TIEmployee } from "../Drizzle/schema";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../mailer/mailer";    
import { createPasswordResetToken } from "../utils/resetToken";

// CSV/XLSX row typing
type EmployeeCSVRow = {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  gender: "male" | "female";
  role?: string;
  departmentId: string | number;
  reportsTo?: string | number | null;
  dateHired?: string;
  password?: string;
  imageUrl?: string;
};

// Generate random password
const generatePassword = () => crypto.randomBytes(4).toString("hex");

// CREATE EMPLOYEE 
export const addEmployeeService = async (employee: TIEmployee) => {
  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Resolve roleId
  let roleId: number | undefined = (employee as any).roleId ?? ((employee as any).role as unknown as number);
  const empRole = (employee as any).role;
  if (typeof empRole === "string") {
    const roleRecord = await db.query.roles.findFirst({ where: eq(roles.name, empRole) });
    if (!roleRecord) throw new Error(`Role '${empRole}' not found`);
    roleId = roleRecord.id;
  }
  if (typeof roleId !== "number") {
    throw new Error("roleId must be provided or resolvable from role name");
  }

  await db.insert(employees).values({
    ...employee,
    roleId,
    ...(employees.password ? { password: hashedPassword } : {}),
  });

  const token = await createPasswordResetToken(employee.email);
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail(
    employee.email,
    "Your Account & Password Reset",
    `
    Hello ${employee.firstname},

    Your employee HRMS account has been created.

    Temporary Password: ${plainPassword}

    You may continue using this password, OR reset it using the link below:
    ${resetLink}

    This link expires in 30 minutes.

    Welcome onboard!
    `,
    `
    <p>Hello ${employee.firstname},</p>
    <p>Your employee HRMS account has been created.</p>
    <p><strong>Temporary Password:</strong> ${plainPassword}</p>

    <p>You may continue using this password, or click the button below to reset it:</p>

    <a href="${resetLink}"
       style="
         background:#007bff;
         color:white;
         padding:10px 20px;
         border-radius:6px;
         text-decoration:none;
         display:inline-block;
         margin-top:10px;
       ">
       Reset Password
    </a>

    <p>This link expires in 30 minutes.</p>
    <p>Welcome onboard!</p>
    `
  );

  return "Employee added successfully";
};

// UPLOAD EMPLOYEES (CSV + XLSX)
export const uploadEmployeesService = async (buffer: Buffer, mimetype: string) => {
  let records: unknown[];

  if (mimetype === "text/csv") {
    const csvData = buffer.toString();
    records = parse(csvData, { columns: true, skip_empty_lines: true });
  } else if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimetype === "application/vnd.ms-excel"
  ) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    records = XLSX.utils.sheet_to_json(sheet);
  } else {
    throw new Error("Unsupported file format. Upload CSV or XLSX only.");
  }

  let count = 0;

  for (const row of records) {
    const r = row as EmployeeCSVRow;
    const plainPassword = generatePassword();
    const hashed = await bcrypt.hash(plainPassword, 10);

    // Resolve roleId
    let roleId: number | undefined;
    if (r.role) {
      const roleRecord = await db.query.roles.findFirst({ where: eq(roles.name, r.role) });
      if (!roleRecord) throw new Error(`Role '${r.role}' not found`);
      roleId = roleRecord.id;
    }

    const emp: TIEmployee = {
      firstname: r.firstname,
      lastname: r.lastname,
      email: r.email,
      phone: r.phone,
      gender: r.gender,
      roleId: roleId as number,
      departmentId: Number(r.departmentId),
      reportsTo: r.reportsTo ? Number(r.reportsTo) : null,
      dateHired: r.dateHired ? new Date(r.dateHired).toISOString() : undefined,
      password: hashed,
      imageUrl: r.imageUrl || undefined,
    };

    await db.insert(employees).values(emp);

    const token = await createPasswordResetToken(r.email);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
      r.email,
      "Your Account & Password Reset",
      `
      Hello ${r.firstname},

      Your employee account has been created.

      Temporary Password: ${plainPassword}

      You may continue using this password, OR reset it using this link:
      ${resetLink}

      This link expires in 30 minutes.

      Welcome onboard!
      `,
      `
      <p>Hello ${r.firstname},</p>
      <p>Your employee HRMS account has been created.</p>
      <p><strong>Temporary Password:</strong> ${plainPassword}</p>

      <p>You may continue using this password, or reset it by clicking the button below:</p>

      <a href="${resetLink}"
         style="
           background:#007bff;
           color:white;
           padding:10px 20px;
           border-radius:6px;
           text-decoration:none;
           display:inline-block;
           margin-top:10px;
         ">
         Reset Password
      </a>

      <p>This link expires in 30 minutes.</p>
      <p>Welcome onboard!</p>
      `
    );

    count++;
  }

  return { message: `${count} employees uploaded successfully` };
};

// ADMIN RESET EMPLOYEE PASSWORD
export const adminResetEmployeePasswordService = async (employeeId: number) => {
  const employee = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  if (!employee) throw new Error("Employee not found");

  const plain = crypto.randomBytes(4).toString("hex");
  const hashed = await bcrypt.hash(plain, 10);

  await db.update(employees).set({ password: hashed }).where(eq(employees.id, employeeId));

  const token = await createPasswordResetToken(employee.email);
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail(
    employee.email,
    "Your Password Has Been Reset by Admin",
    `
Hello ${employee.firstname},

Your password has been reset by the HR/Admin team.

Temporary Password: ${plain}

You may login with this password, OR set a new one using this link:
${resetLink}

This link expires in 30 minutes.
    `,
    `
    <p>Hello ${employee.firstname},</p>
    <p>Your password has been reset by the HR/Admin team.</p>

    <p><strong>Temporary Password:</strong> ${plain}</p>

    <p>You may continue using this password, or you can click the button below to set a new password:</p>

    <a href="${resetLink}"
       style="
         background:#dc3545;
         color:white;
         padding:10px 20px;
         border-radius:6px;
         text-decoration:none;
         display:inline-block;
         margin-top:10px;
       ">
       Reset Password
    </a>

    <p>This link expires in 30 minutes.</p>
    `
  );

  return "Password reset successful & email sent";
};

// GET EMPLOYEE BY EMAIL
export const getEmployeeByEmailService = async (email: string) => {
  return await db.query.employees.findFirst({
    where: sql`${employees.email} = ${email}`,
    with: { role: { with: { permissions: true } } }, // RBAC included
  });
};

// GET EMPLOYEE BY NAME
export const getEmployeeByNameService = async (name: string) => {
  const search = `%${name}%`;
  return await db.query.employees.findMany({
    where: ilike(sql`${employees.firstname} || ' ' || ${employees.lastname}`, search),
    with: { role: { with: { permissions: true } } },
  });
};

// GET ALL EMPLOYEES
export const getEmployeesService = async () => {
  return await db.query.employees.findMany({
    with: { role: { with: { permissions: true } } },
  });
};

// GET EMPLOYEE BY ID
export const getEmployeeByIdService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: { role: { with: { permissions: true } } },
  });
};

// UPDATE EMPLOYEE
export const updateEmployeeService = async (id: number, data: Partial<TIEmployee>) => {
  const updated = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
  if (updated.length === 0) return null;
  return "Employee updated successfully";
};

// PERMANENT DELETE EMPLOYEE
export const deleteEmployeeService = async (id: number) => {
  const deleted = await db.delete(employees).where(eq(employees.id, id)).returning();
  if (deleted.length === 0) return null;
  return "Employee permanently deleted successfully";
};

// EMPLOYEE WITH DEPARTMENT
export const getEmployeeWithDepartmentService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: { department: true, role: { with: { permissions: true } } },
  });
};

// EMPLOYEE WITH MANAGER
export const getEmployeeWithManagerService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: { manager: true, role: { with: { permissions: true } } },
  });
};

// MANAGER WITH TEAM
export const getManagerWithTeamService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: { subordinates: { with: { role: { with: { permissions: true } } } } },
  });
};

// FULL RELATIONS
export const getEmployeeWithRelationsService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: {
      department: true,
      manager: true,
      subordinates: { with: { role: { with: { permissions: true } } } },
      role: { with: { permissions: true } },
    },
  });
};
