import { eq, sql, ilike } from "drizzle-orm";
import db from "../Drizzle/db";
import { 
  employees, departments, roles, rolePermissions, permissions, userRoles, TIEmployee 
} from "../Drizzle/schema";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../mailer/mailer";    
import { createPasswordResetToken } from "../utils/resetToken";
import { signToken } from "../utils/jwt";

// CSV/XLSX row typing
type EmployeeCSVRow = {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  gender: "male" | "female";
  role?: string;
  departmentId: string | number;
  departmentName?: string;
  reportsTo?: string | number | null;
  dateHired?: string;
  jobTitle?: string;
  password?: string;
  imageUrl?: string;
};

// Generate random password
const generatePassword = () => crypto.randomBytes(4).toString("hex");

// CREATE EMPLOYEE 
export const addEmployeeService = async (
  employee: TIEmployee & { role?: string },
  allowBootstrap = false
) => {
  // Check if there are any employees
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(employees);
  const totalEmployees = Number(count);

  // Generate a temporary password
  const plainPassword = crypto.randomBytes(6).toString("hex");

  // Super Admin Creation if no employees exist and bootstrap allowed
  if (totalEmployees === 0 && allowBootstrap) {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const superAdmin = await db.insert(employees).values({
      firstname: "Super",
      lastname: "Admin",
      email: "wamahiucharles123@gmail.com",
      phone: "+254701656349",
      gender: "male",
      contractType: "full_time",
      jobTitle: "System Administrator",
      status: "active",
      dateHired: new Date().toISOString(),
      password: hashedPassword,
      departmentId: null,
    }).returning();

    const superAdminId = superAdmin[0].id;

    // Create super_admin role if not exists
    let superAdminRole = await db.query.roles.findFirst({
      where: eq(roles.name, "super_admin"),
    });

    if (!superAdminRole) {
      const role = await db.insert(roles).values({
        name: "super_admin",
        description: "System Super Administrator with full access",
      }).returning();
      superAdminRole = role[0];
    }

    // Assign all permissions to super_admin role
    const allPermissions = await db.query.permissions.findMany();
    for (const perm of allPermissions) {
      const exists = await db.query.rolePermissions.findFirst({
        where: eq(rolePermissions.permissionId, perm.id),
      });
      if (!exists) {
        await db.insert(rolePermissions).values({
          permissionId: perm.id,
          roleId: superAdminRole.id,
        });
      }
    }

    // Assign role to super admin
    await db.insert(userRoles).values({
      employeeId: superAdminId,
      roleId: superAdminRole.id,
    });

    // Send password reset email
    const token = await createPasswordResetToken("wamahiucharles123@gmail.com");
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
      "wamahiucharles123@gmail.com",
      "Your Super Admin Account",
      `Hello Super Admin,\n\nYour system Super Admin account has been created.\nTemporary Password: ${plainPassword}\nPlease reset your password using the link below:\n${resetLink}\nThis link expires in 30 minutes.`,
      `<p>Hello Super Admin,</p>
      <p>Your system Super Admin account has been created.</p>
      <p><strong>Temporary Password:</strong> ${plainPassword}</p>
      <p>Please reset your password by clicking the button below:</p>
      <a href="${resetLink}" style="background:#007bff;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">Reset Password</a>
      <p>This link expires in 30 minutes.</p>`
    );

    console.log("Super admin created successfully");
  }

  // Normal Employee Creation
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Resolve role ID (auto-create if it doesn't exist)
  let resolvedRoleId: number | null = null;
  if (employee.role) {
    let roleRecord = await db.query.roles.findFirst({
      where: eq(roles.name, employee.role),
    });

    if (!roleRecord) {
      const insertedRole = await db.insert(roles).values({
        name: employee.role,
        description: `${employee.role} role created automatically`,
      }).returning();
      roleRecord = insertedRole[0];
    }

    resolvedRoleId = roleRecord.id;
  }

  const inserted = await db.insert(employees).values({
    ...employee,
    password: hashedPassword,
    departmentId: employee.departmentId ?? null,
  }).returning();

  const newEmployeeId = inserted[0].id;

  if (resolvedRoleId) {
    await db.insert(userRoles).values({
      employeeId: newEmployeeId,
      roleId: resolvedRoleId,
    });
  }

  // Send password reset email
  const token = await createPasswordResetToken(employee.email);
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail(
    employee.email,
    "Your Account & Password Reset",
    `Hello ${employee.firstname},\n\nYour employee HRMS account has been created.\nTemporary Password: ${plainPassword}\nPlease reset your password using the link below:\n${resetLink}\nThis link expires in 30 minutes.\nWelcome onboard!`,
    `<p>Hello ${employee.firstname},</p>
    <p>Your employee HRMS account has been created.</p>
    <p><strong>Temporary Password:</strong> ${plainPassword}</p>
    <p>Please reset your password by clicking the button below:</p>
    <a href="${resetLink}" style="background:#007bff;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">Reset Password</a>
    <p>This link expires in 30 minutes.</p>
    <p>Welcome onboard!</p>`
  );

  return { message: "Employee added successfully. Credentials have been sent to email." };
};


//UPLOAD EMPLOYEES (CSV + XLSX)
export const uploadEmployeesService = async (buffer: Buffer, mimetype: string) => {
  let records: unknown[];

  if (mimetype === "text/csv") {
    const csvData = buffer.toString();
    records = parse(csvData, { columns: true, skip_empty_lines: true });
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
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

  // Check if there are any employees
  const [{ count: totalEmployeesCount }] = await db.select({ count: sql<number>`count(*)` }).from(employees);
  let totalEmployees = Number(totalEmployeesCount);

  for (const row of records) {
    const r = row as EmployeeCSVRow;

    // Generate a secure temporary password
    const plainPassword = crypto.randomBytes(6).toString("hex");
    const hashed = await bcrypt.hash(plainPassword, 10);

    // Handle first employee as Super Admin if no employees exist
    if (totalEmployees === 0) {
      const superAdminRoleName = "super_admin";

      // Insert super admin
      const inserted = await db.insert(employees).values({
        firstname: r.firstname || "Super",
        lastname: r.lastname || "Admin",
        email: r.email || "wamahiucharles123@gmail.com",
        phone: r.phone || "+254701656349",
        gender: r.gender || "male",
        departmentId: null,
        reportsTo: null,
        dateHired: r.dateHired ? new Date(r.dateHired).toISOString() : new Date().toISOString(),
        password: hashed,
        imageUrl: r.imageUrl || undefined,
        status: "active",
        contractType: "full_time",
        jobTitle: r.jobTitle || "System Administrator",
      }).returning();

      const superAdminId = inserted[0].id;

      // Create super_admin role if not exists
      let superAdminRole = await db.query.roles.findFirst({
        where: eq(roles.name, superAdminRoleName),
      });

      if (!superAdminRole) {
        const role = await db.insert(roles).values({
          name: superAdminRoleName,
          description: "System Super Administrator with full access",
        }).returning();
        superAdminRole = role[0];
      }

      // Assign all permissions to super_admin role
      const allPermissions = await db.query.permissions.findMany();
      for (const perm of allPermissions) {
        const exists = await db.query.rolePermissions.findFirst({
          where: eq(rolePermissions.permissionId, perm.id),
        });
        if (!exists) {
          await db.insert(rolePermissions).values({
            permissionId: perm.id,
            roleId: superAdminRole.id,
          });
        }
      }

      // Assign role to super admin
      await db.insert(userRoles).values({
        employeeId: superAdminId,
        roleId: superAdminRole.id,
      });

      // Send password reset email
      const token = await createPasswordResetToken(r.email || "wamahiucharles123@gmail.com");
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await sendEmail(
        r.email || "wamahiucharles123@gmail.com",
        "Your Super Admin Account",
        `Hello Super Admin,\n\nYour system Super Admin account has been created.\nTemporary Password: ${plainPassword}\nPlease reset your password using the link below:\n${resetLink}\nThis link expires in 30 minutes.`,
        `<p>Hello Super Admin,</p>
         <p>Your system Super Admin account has been created.</p>
         <p><strong>Temporary Password:</strong> ${plainPassword}</p>
         <p>Please reset your password by clicking the button below:</p>
         <a href="${resetLink}" style="background:#007bff;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">Reset Password</a>
         <p>This link expires in 30 minutes.</p>`
      );

      totalEmployees++; // update employee count
      count++;
      continue; // skip to next row
    }

    // Resolve or create department
    let departmentId: number | null = null;
    if (r.departmentId) {
      departmentId = Number(r.departmentId);
    } else if (r.departmentName) {
      let dept = await db.query.departments.findFirst({
        where: eq(departments.name, r.departmentName),
      });
      if (!dept) {
        const insertedDept = await db.insert(departments).values({
          name: r.departmentName,
          description: `${r.departmentName} department created automatically`,
        }).returning();
        dept = insertedDept[0];
      }
      departmentId = dept.id;
    } else {
      throw new Error(`Department is required for employee ${r.firstname} ${r.lastname}`);
    }

    // Resolve or create role
    let roleId: number | null = null;
    if (r.role) {
      let roleRecord = await db.query.roles.findFirst({
        where: eq(roles.name, r.role),
      });

      if (!roleRecord) {
        const insertedRole = await db.insert(roles).values({
          name: r.role,
          description: `${r.role} role created automatically`,
        }).returning();
        roleRecord = insertedRole[0];
      }

      roleId = roleRecord.id;
    }

    // Insert employee
    const inserted = await db.insert(employees).values({
      firstname: r.firstname,
      lastname: r.lastname,
      email: r.email,
      phone: r.phone,
      gender: r.gender,
      departmentId,
      reportsTo: r.reportsTo ? Number(r.reportsTo) : null,
      dateHired: r.dateHired ? new Date(r.dateHired).toISOString() : undefined,
      password: hashed,
      imageUrl: r.imageUrl || undefined,
    }).returning();

    const newId = inserted[0].id;

    // Assign role
    if (roleId) {
      await db.insert(userRoles).values({
        employeeId: newId,
        roleId,
      });
    }

    // Send password reset email
    const token = await createPasswordResetToken(r.email);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
      r.email,
      "Your Account & Password Reset",
      `
Hello ${r.firstname},

Your employee HRMS account has been created.

Temporary Password: ${plainPassword}

Please reset your password using the link below:
${resetLink}

This link expires in 30 minutes.

Welcome onboard!
      `,
      `
<p>Hello ${r.firstname},</p>
<p>Your employee HRMS account has been created.</p>
<p><strong>Temporary Password:</strong> ${plainPassword}</p>
<p>Please reset your password by clicking the button below:</p>
<a href="${resetLink}" style="
  background:#007bff;
  color:white;
  padding:10px 20px;
  border-radius:6px;
  text-decoration:none;
  display:inline-block;
  margin-top:10px;
">Reset Password</a>
<p>This link expires in 30 minutes.</p>
<p>Welcome onboard!</p>
`
    );

    count++;
  }

  return { message: `${count} employees uploaded successfully. Passwords have been sent via email.` };
};

// LOGIN EMPLOYEE
export const loginEmployeeService = async (email: string, password: string) => {
  // Find employee by email along with roles and permissions (include permission relation)
  const employee = await db.query.employees.findFirst({
    where: eq(employees.email, email),
    with: {
      roles: {
        with: {
          role: {
            with: {
              permissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!employee || !employee.password) {
    throw new Error("Invalid email or password");
  }

  // Validate password
  const isValid = await bcrypt.compare(password, employee.password);
  if (!isValid) throw new Error("Invalid email or password");

  // Flatten permissions into a string array 
  const permissions = employee.roles
    .flatMap((r) => r.role.permissions.map((rp) => (rp.permission ? rp.permission.name : null)))
    .filter((n): n is string => !!n);

  // Generate JWT token including roles and permissions
  const token = signToken({
    id: employee.id,
    email: employee.email,
    roles: employee.roles.map((r) => r.role.name),
    permissions,
  });

  return {
    message: "Login successful",
    token,
    employee,
    permissions,
  };
};

// ADMIN RESET EMPLOYEE PASSWORD
export const adminResetEmployeePasswordService = async (employeeId: number) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId)
  });
  
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
    with: {
      roles: {
        with: {
          role: {
            with: {
              permissions: true
            }
          }
        }
      }
    }
  });
};

// GET EMPLOYEE BY NAME
export const getEmployeeByNameService = async (name: string) => {
  const search = `%${name}%`;
  return await db.query.employees.findMany({
    where: ilike(sql`${employees.firstname} || ' ' || ${employees.lastname}`, search),
    with: {
      roles: {
        with: {
          role: { with: { permissions: true } }
        }
      }
    }
  });
};

// GET ALL EMPLOYEES
export const getEmployeesService = async () => {
  return await db.query.employees.findMany({
    with: {
      roles: {
        with: {
          role: { with: { permissions: true } }
        }
      }
    }
  });
};

// GET EMPLOYEE BY ID
export const getEmployeeByIdService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: {
      roles: {
        with: {
          role: { with: { permissions: true } }
        }
      }
    }
  });
};

// UPDATE EMPLOYEE
export const updateEmployeeService = async (id: number, data: Partial<TIEmployee>) => {
  const updated = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
  if (updated.length === 0) return null;
  return "Employee updated successfully";
};

// DELETE EMPLOYEE
export const deleteEmployeeService = async (id: number) => {
  const deleted = await db.delete(employees).where(eq(employees.id, id)).returning();
  if (deleted.length === 0) return null;
  return "Employee permanently deleted successfully";
};

// EMPLOYEE WITH DEPARTMENT
export const getEmployeeWithDepartmentService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: {
      department: true,
      roles: {
        with: {
          role: { with: { permissions: true } } 
        }
      }
    }
  });
};

// EMPLOYEE WITH MANAGER
export const getEmployeeWithManagerService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: {
      manager: true,
      roles: {
        with: {
          role: { with: { permissions: true } }
        }
      }
    }
  });
};

// MANAGER WITH TEAM
export const getManagerWithTeamService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: {
      subordinates: {
        with: {
          roles: {
            with: {
              role: { with: { permissions: true } }
            }
          }
        }
      }
    }
  });
};

// FULL RELATIONS
export const getEmployeeWithRelationsService = async (id: number) => {
  return await db.query.employees.findFirst({
    where: eq(employees.id, id),
    with: {
      department: true,
      manager: true,
      subordinates: {
        with: {
          roles: {
            with: {
              role: { with: { permissions: true } }
            }
          }
        }
      },
      roles: {
        with: {
          role: { with: { permissions: true } }
        }
      }
    }
  });
};