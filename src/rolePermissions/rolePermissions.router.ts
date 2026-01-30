import { Express } from "express";
import {
  assignPermissionToRoleController,
  getRolePermissionsController,
  getRolePermissionsByRoleController,
  removePermissionFromRoleController,
  getEmployeePermissionsController,
  getRolePermissionByIdController,
} from "./rolePermissions.controller";

import { checkPermission } from "../middleware/bearAuth";

const rolePermissionRoutes = (app: Express) => {

  // ASSIGN PERMISSION TO ROLE
  app.route("/role-permissions").post(
    checkPermission("assign_permission", { allowBootstrap: true }),
    async (req, res, next) => {
      try {
        await assignPermissionToRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL ROLE PERMISSIONS
  app.route("/role-permissions").get(
    checkPermission("view_role_permissions"),
    async (req, res, next) => {
      try {
        await getRolePermissionsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ROLE PERMISSIONS BY ROLE
  app.route("/role-permissions/role/:roleId").get(
    checkPermission("view_role_permissions"),
    async (req, res, next) => {
      try {
        await getRolePermissionsByRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ROLE PERMISSION BY ID
  app.route("/role-permissions/:id").get(
    checkPermission("view_role_permissions"),
    async (req, res, next) => {
      try {
        await getRolePermissionByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // REMOVE PERMISSION FROM ROLE
  app.route("/role-permissions/remove").delete(
    checkPermission("remove_permission"),
    async (req, res, next) => {
      try {
        await removePermissionFromRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL PERMISSIONS OF AN EMPLOYEE THROUGH THEIR ROLES
  app.route("/role-permissions/employee/:employeeId").get(
    checkPermission("view_employee_permissions"),
    async (req, res, next) => {
      try {
        await getEmployeePermissionsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default rolePermissionRoutes;
