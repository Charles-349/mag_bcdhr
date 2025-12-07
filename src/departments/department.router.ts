import { Express } from "express";
import {
  addDepartmentController,
  getDepartmentsController,
  getDepartmentByIdController,
  getDepartmentByNameController,
  updateDepartmentController,
  deleteDepartmentController,
  getDepartmentWithEmployeesController,
  getDepartmentsByCompanyIdController,
} from "./department.controller";

import { checkPermission } from "../middleware/bearAuth";

const department = (app: Express) => {
  // CREATE DEPARTMENT
  app.route("/departments").post(
    checkPermission("create_department", { allowBootstrap: true }),
    async (req, res, next) => {
      try {
        await addDepartmentController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL DEPARTMENTS
  app.route("/departments").get(
    checkPermission("view_department"),
    async (req, res, next) => {
      try {
        await getDepartmentsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET DEPARTMENT BY ID
  app.route("/departments/:id").get(
    checkPermission("view_department"),
    async (req, res, next) => {
      try {
        await getDepartmentByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET DEPARTMENT BY NAME
  app.route("/departments/name/:name").get(
    checkPermission("view_department"),
    async (req, res, next) => {
      try {
        await getDepartmentByNameController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //GET DEPARTMENTS BY COMPANY ID
  app.route("/departments/company/:companyId").get(
    checkPermission("view_department"),
    async (req, res, next) => {
      try {
        await getDepartmentsByCompanyIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE DEPARTMENT
  app.route("/departments/:id").put(
    checkPermission("update_department"),
    async (req, res, next) => {
      try {
        await updateDepartmentController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE DEPARTMENT
  app.route("/departments/:id").delete(
    checkPermission("delete_department"),
    async (req, res, next) => {
      try {
        await deleteDepartmentController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET DEPARTMENT WITH EMPLOYEES
  app.route("/departments/:id/employees").get(
    checkPermission("view_department_employees"),
    async (req, res, next) => {
      try {
        await getDepartmentWithEmployeesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );
};

export default department;
