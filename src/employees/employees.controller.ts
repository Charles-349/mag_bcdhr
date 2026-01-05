// import { Request, Response } from "express";
// import {
//   addEmployeeService,
//   getEmployeesService,
//   getEmployeeByIdService,
//   updateEmployeeService,
//   deleteEmployeeService,
//   getEmployeeWithDepartmentService,
//   getEmployeeWithManagerService,
//   getManagerWithTeamService,
//   getEmployeeWithRelationsService,
//   getEmployeeByEmailService,
//   getEmployeeByNameService,
//   uploadEmployeesService,
//   adminResetEmployeePasswordService,
//   loginEmployeeService,
// } from "./employees.service";

// // CREATE EMPLOYEE
// export const addEmployeeController = async (req: Request, res: Response) => {
//   try {
//     const employee = req.body;

//     // Check for bootstrap mode 
//     const result = await addEmployeeService(employee, true); 

//     return res.status(201).json({
//       message: result.message,
//     });
//   } catch (error: any) {
//     console.error("Error creating employee:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // UPLOAD EMPLOYEES (CSV/XLSX)
// export const uploadEmployeesController = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const result = await uploadEmployeesService(req.file.buffer, req.file.mimetype);
//     return res.status(200).json(result);
//   } catch (error: any) {
//     console.error("Error uploading employees:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // LOGIN EMPLOYEE
// export const loginEmployeeController = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const result = await loginEmployeeService(email, password);

//     return res.status(200).json({
//       message: result.message,
//       token: result.token,
//       employee: result.employee,
//       permissions: result.permissions
//     });
//   } catch (error: any) {
//     console.error("Error logging in employee:", error);
//     return res.status(401).json({ message: error.message });
//   }
// };

// // ADMIN RESET EMPLOYEE PASSWORD
// export const adminResetEmployeePasswordController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const result = await adminResetEmployeePasswordService(id);

//     return res.status(200).json({
//       message: "Password reset successful. Email sent to employee",
//     });
//   } catch (error: any) {
//     console.error("Error resetting employee password:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // GET EMPLOYEE BY EMAIL
// export const getEmployeeByEmailController = async (req: Request, res: Response) => {
//   try {
//     const email = req.params.email;
//     const employee = await getEmployeeByEmailService(email);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       message: "Employee retrieved successfully",
//       employee,
//     });
//   } catch (error: any) {
//     console.error("Error fetching employee by email:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // GET EMPLOYEE BY NAME
// export const getEmployeeByNameController = async (req: Request, res: Response) => {
//   try {
//     const { name } = req.params;

//     if (!name) {
//       return res.status(400).json({ message: "Name parameter is required" });
//     }

//     const employees = await getEmployeeByNameService(name);

//     if (!employees || employees.length === 0) {
//       return res.status(404).json({ message: "No employees found matching that name" });
//     }

//     return res.status(200).json({
//       message: "Employees retrieved successfully",
//       data: employees,
//     });
//   } catch (error: any) {
//     console.error("Error fetching employees by name:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // GET ALL EMPLOYEES
// export const getEmployeesController = async (_req: Request, res: Response) => {
//   try {
//     const employees = await getEmployeesService();

//     return res.status(200).json({
//       message: "Employees retrieved successfully",
//       employees,
//     });
//   } catch (error: any) {
//     console.error("Error retrieving employees:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // GET EMPLOYEE BY ID
// export const getEmployeeByIdController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const employee = await getEmployeeByIdService(id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       message: "Employee retrieved successfully",
//       employee,
//     });
//   } catch (error: any) {
//     console.error("Error fetching employee:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // UPDATE EMPLOYEE
// export const updateEmployeeController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const updated = await updateEmployeeService(id, req.body);

//     if (!updated) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       message: "Employee updated successfully",
//     });
//   } catch (error: any) {
//     console.error("Error updating employee:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // DELETE EMPLOYEE
// export const deleteEmployeeController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const result = await deleteEmployeeService(id);

//     if (!result) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({ message: "Employee permanently deleted successfully" });
//   } catch (error: any) {
//     console.error("Error deleting employee:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // EMPLOYEE WITH DEPARTMENT
// export const getEmployeeWithDepartmentController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const employee = await getEmployeeWithDepartmentService(id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       message: "Employee with department retrieved successfully",
//       employee,
//     });
//   } catch (error: any) {
//     console.error("Error retrieving employee with department:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // EMPLOYEE WITH MANAGER
// export const getEmployeeWithManagerController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const employee = await getEmployeeWithManagerService(id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       message: "Employee with manager retrieved successfully",
//       employee,
//     });
//   } catch (error: any) {
//     console.error("Error retrieving employee with manager:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // MANAGER WITH TEAM
// export const getManagerWithTeamController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const manager = await getManagerWithTeamService(id);

//     if (!manager) {
//       return res.status(404).json({ message: "Manager not found" });
//     }

//     return res.status(200).json({
//       message: "Manager with team retrieved successfully",
//       manager,
//     });
//   } catch (error: any) {
//     console.error("Error retrieving manager with team:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // EMPLOYEE WITH FULL RELATIONS
// export const getEmployeeWithRelationsController = async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const employee = await getEmployeeWithRelationsService(id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       message: "Employee with full relations retrieved successfully",
//       employee,
//     });
//   } catch (error: any) {
//     console.error("Error retrieving employee relations:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };


import { Request, Response } from "express";
import {
  addEmployeeService,
  getEmployeesService,
  getEmployeeByEmailService,
  updateEmployeeService,
  deleteEmployeeService,
  adminResetEmployeePasswordService,
  loginUserService,
  getEmployeesByCompanyIdService,
  getEmployeeByIdService,
} from "./employees.service";

// CREATE EMPLOYEE
export const addEmployeeController = async (req: Request, res: Response) => {
  try {
    const employee = req.body;

    // allowBootstrap,,,,true to enable first-user super admin creation
    const result = await addEmployeeService(employee, true);

    return res.status(201).json({
      message: result.message,
      employee: result.employee,
    });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN EMPLOYEE
export const loginEmployeeController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const result = await loginUserService(email, password);

    return res.status(200).json({
      message: result.message,
      token: result.token,
      user: result.user,
      permissions: result.permissions,
    });
  } catch (error: any) {
    console.error("Error logging in employee:", error);
    return res.status(401).json({ message: error.message });
  }
};

// GET EMPLOYEE BY EMAIL
export const getEmployeeByEmailController = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;

    const employee = await getEmployeeByEmailService(email);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    return res.status(200).json({
      message: "Employee retrieved successfully",
      employee,
    });
  } catch (error: any) {
    console.error("Error fetching employee by email:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET EMPLOYEE BY ID
export const getEmployeeByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await getEmployeeByIdService(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee retrieved successfully",
      employee,
    });
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL EMPLOYEES
export const getEmployeesController = async (_req: Request, res: Response) => {
  try {
    const employees = await getEmployeesService();

    return res.status(200).json({
      message: "Employees retrieved successfully",
      employees,
    });
  } catch (error: any) {
    console.error("Error retrieving employees:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE EMPLOYEE
export const updateEmployeeController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateEmployeeService(id, req.body);

    if (!updated)
      return res.status(404).json({ message: "Employee not found" });

    return res.status(200).json({
      message: "Employee updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE EMPLOYEE
export const deleteEmployeeController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteEmployeeService(id);

    if (!result)
      return res.status(404).json({ message: "Employee not found" });

    return res.status(200).json({
      message: "Employee permanently deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ADMIN RESET PASSWORD
export const adminResetEmployeePasswordController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    await adminResetEmployeePasswordService(id);

    return res.status(200).json({
      message: "Password reset successful. Email sent to employee",
    });
  } catch (error: any) {
    console.error("Error resetting employee password:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET EMPLOYEES BY COMPANY ID
export const getEmployeesByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);

    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const employees = await getEmployeesByCompanyIdService(companyId);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        message: "No employees found for this company",
      });
    }

    return res.status(200).json({
      message: "Employees retrieved successfully",
      employees,
    });
  } catch (error: any) {
    console.error("Error fetching employees by company ID:", error);
    return res.status(500).json({ message: error.message });
  }
};

