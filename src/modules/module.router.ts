import { Express } from "express";
import {
  createModuleController,
  getAllModulesController,
  getModuleByIdController,
  updateModuleController,
  deleteModuleController,
} from "./module.controller";

import { checkPermission } from "../middleware/bearAuth";

const modulesRoute = (app: Express) => {
  
  // CREATE MODULE
  app.route("/modules").post(
    checkPermission("create_module , { allowBootstrap: true }),"),
    async (req, res, next) => {
      try {
        await createModuleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL MODULES
  app.route("/modules").get(
    checkPermission("view_module"),
    async (req, res, next) => {
      try {
        await getAllModulesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET MODULE BY ID
  app.route("/modules/:id").get(
    checkPermission("view_module"),
    async (req, res, next) => {
      try {
        await getModuleByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE MODULE
  app.route("/modules/:id").put(
    checkPermission("update_module"),
    async (req, res, next) => {
      try {
        await updateModuleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE MODULE
  app.route("/modules/:id").delete(
    checkPermission("delete_module"),
    async (req, res, next) => {
      try {
        await deleteModuleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default modulesRoute;
