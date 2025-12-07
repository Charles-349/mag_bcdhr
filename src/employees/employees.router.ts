// import { Express } from "express";
// import multer from "multer";

// import {
//   addEmployeeController,
//   getEmployeesController,
//   getEmployeeByIdController,
//   updateEmployeeController,
//   deleteEmployeeController,
//   getEmployeeWithDepartmentController,
//   getEmployeeWithManagerController,
//   getManagerWithTeamController,
//   getEmployeeWithRelationsController,
//   getEmployeeByEmailController,
//   getEmployeeByNameController,
//   uploadEmployeesController,
//   adminResetEmployeePasswordController,
//   loginEmployeeController,
// } from "./employees.controller";

// import { checkPermission } from "../middleware/bearAuth";

// const upload = multer(); 

// const employee = (app: Express) => {

//   // CREATE Employee
//   app.route("/employees").post(
//     checkPermission("create_employee", { allowBootstrap: true }), 
//     async (req, res, next) => {
//       try {
//         await addEmployeeController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // UPLOAD Employees (CSV/XLSX)
//   app.route("/employees/upload").post(
//     checkPermission("upload_employee"), 
//     upload.single("file"),
//     async (req, res, next) => {
//       try {
//         await uploadEmployeesController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//     // LOGIN ROUTE
//   app.route("/employees/login").post(async (req, res, next) => {
//     try {
//       await loginEmployeeController(req, res);
//     } catch (error) {
//       next(error);
//     }
//   });

//   // ADMIN RESET EMPLOYEE PASSWORD
//   app.route("/employees/:id/reset-password").post(
//     checkPermission("reset_employee_password"), 
//     async (req, res, next) => {
//       try {
//         await adminResetEmployeePasswordController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // GET EMPLOYEE BY EMAIL
//   app.route("/employees/email/:email").get(
//     checkPermission("view_employee"),
//     async (req, res, next) => {
//       try {
//         await getEmployeeByEmailController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // GET Employee by Name
//   app.route("/employees/name/:name").get(
//     checkPermission("view_employee"), 
//     async (req, res, next) => {
//       try {
//         await getEmployeeByNameController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // GET All Employees
//   app.route("/employees").get(
//     checkPermission("view_employee"),
//     async (req, res, next) => {
//       try {
//         await getEmployeesController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // GET Employee by ID
//   app.route("/employees/:id").get(
//     checkPermission("view_employee"), 
//     async (req, res, next) => {
//       try {
//         await getEmployeeByIdController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // UPDATE Employee by ID
//   app.route("/employees/:id").put(
//     checkPermission("update_employee"),
//     async (req, res, next) => {
//       try {
//         await updateEmployeeController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // DELETE Employee by ID
//   app.route("/employees/:id").delete(
//     checkPermission("delete_employee"),
//     async (req, res, next) => {
//       try {
//         await deleteEmployeeController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // EMPLOYEE WITH DEPARTMENT
//   app.route("/employees/:id/department").get(
//     checkPermission("view_employee_department"), 
//     async (req, res, next) => {
//       try {
//         await getEmployeeWithDepartmentController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // EMPLOYEE WITH MANAGER
//   app.route("/employees/:id/manager").get(
//     checkPermission("view_employee_manager"), 
//     async (req, res, next) => {
//       try {
//         await getEmployeeWithManagerController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // MANAGER WITH TEAM (subordinates)
//   app.route("/employees/:id/team").get(
//     checkPermission("view_employee_team"), 
//     async (req, res, next) => {
//       try {
//         await getManagerWithTeamController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

//   // EMPLOYEE WITH FULL RELATIONS (department + manager + subordinates)
//   app.route("/employees/:id/relations").get(
//     checkPermission("view_employee_relations"), 
//     async (req, res, next) => {
//       try {
//         await getEmployeeWithRelationsController(req, res);
//       } catch (error) {
//         next(error);
//       }
//     }
//   );

// };

// export default employee;


import { Express } from "express";
import multer from "multer";

import {
  addEmployeeController,
  getEmployeesController,
  getEmployeeByEmailController,
  updateEmployeeController,
  deleteEmployeeController,
  adminResetEmployeePasswordController,
  loginEmployeeController,
  getEmployeesByCompanyIdController,
} from "./employees.controller";

import { checkPermission } from "../middleware/bearAuth";

const upload = multer();

const employee = (app: Express) => {
  // CREATE EMPLOYEE (Bootstrap allowed)
  app.route("/employees").post(
    checkPermission("create_employee", { allowBootstrap: true }),
    async (req, res, next) => {
      try {
        await addEmployeeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // LOGIN EMPLOYEE
  app.route("/employees/login").post(async (req, res, next) => {
    try {
      await loginEmployeeController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ADMIN RESET PASSWORD
  app.route("/employees/:id/reset-password").post(
    checkPermission("reset_employee_password"),
    async (req, res, next) => {
      try {
        await adminResetEmployeePasswordController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET EMPLOYEE BY EMAIL
  app.route("/employees/email/:email").get(
    checkPermission("view_employee_profile"),
    async (req, res, next) => {
      try {
        await getEmployeeByEmailController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL EMPLOYEES
  app.route("/employees").get(
    checkPermission("view_employee"),
    async (req, res, next) => {
      try {
        await getEmployeesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //GET EMPLOYEE BY COMPANY ID
  app.route("/employees/company/:companyId").get(
    checkPermission("view_employee"),
    async (req, res, next) => {
      try {
        await getEmployeesByCompanyIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE EMPLOYEE
  app.route("/employees/:id").put(
    checkPermission("update_employee"),
    async (req, res, next) => {
      try {
        await updateEmployeeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE EMPLOYEE
  app.route("/employees/:id").delete(
    checkPermission("delete_employee"),
    async (req, res, next) => {
      try {
        await deleteEmployeeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );
};

export default employee;

