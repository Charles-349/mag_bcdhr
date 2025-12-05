import { Express } from "express";
import {
  addRoleController,
  getRolesController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
  assignPermissionsController,
  getRolePermissionsController,
} from "./roles.controller";

import { checkPermission } from "../middleware/bearAuth";

const roleRoutes = (app: Express) => {

  // CREATE ROLE
app.route("/roles").post(
  checkPermission("create_role", { allowBootstrap: true }),
  async (req, res, next) => {
    try {
      await addRoleController(req, res);
    } catch (error) {
      next(error);
    }
  }
);

  // GET ALL ROLES
  app.route("/roles").get(
    checkPermission("view_role"),
    async (req, res, next) => {
      try {
        await getRolesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ROLE BY ID
  app.route("/roles/:id").get(
    checkPermission("view_role"),
    async (req, res, next) => {
      try {
        await getRoleByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE ROLE
  app.route("/roles/:id").put(
    checkPermission("update_role"),
    async (req, res, next) => {
      try {
        await updateRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE ROLE
  app.route("/roles/:id").delete(
    checkPermission("delete_role"),
    async (req, res, next) => {
      try {
        await deleteRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // ASSIGN PERMISSIONS TO ROLE
  app.route("/roles/:id/permissions").post(
    checkPermission("assign_permissions"),
    async (req, res, next) => {
      try {
        await assignPermissionsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ROLE PERMISSIONS
  app.route("/roles/:id/permissions").get(
    checkPermission("view_permissions"),
    async (req, res, next) => {
      try {
        await getRolePermissionsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default roleRoutes;
