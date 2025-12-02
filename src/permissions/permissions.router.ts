import { Express } from "express";
import {
  addPermissionController,
  getPermissionsController,
  getPermissionByIdController,
  updatePermissionController,
  deletePermissionController,
} from "./permissions.controller";

import { checkPermission } from "../middleware/bearAuth";

const permissionRoutes = (app: Express) => {

  // CREATE PERMISSION
 app.route("/permissions").post(
  checkPermission("create_permission", { allowBootstrap: true }),
  async (req, res, next) => {
    try {
      await addPermissionController(req, res);
    } catch (error) {
      next(error);
    }
  }
);


  // GET ALL PERMISSIONS
  app.route("/permissions").get(
    checkPermission("view_permission"),
    async (req, res, next) => {
      try {
        await getPermissionsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET PERMISSION BY ID
  app.route("/permissions/:id").get(
    checkPermission("view_permission"),
    async (req, res, next) => {
      try {
        await getPermissionByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE PERMISSION
  app.route("/permissions/:id").put(
    checkPermission("update_permission"),
    async (req, res, next) => {
      try {
        await updatePermissionController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE PERMISSION
  app.route("/permissions/:id").delete(
    checkPermission("delete_permission"),
    async (req, res, next) => {
      try {
        await deletePermissionController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default permissionRoutes;
