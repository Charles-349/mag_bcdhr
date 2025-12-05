
import { Express } from "express";
import {
  addUserRoleController,
  getAllUserRolesController,
  getUserRoleByIdController,
  updateUserRoleController,
  deleteUserRoleController
} from "./userRole.controller";

import { checkPermission } from "../middleware/bearAuth";

const userRole = (app: Express) => {

  // ASSIGN ROLE TO EMPLOYEE
  app.route("/user-roles").post(
    checkPermission("assign_role"),
    async (req, res, next) => {
      try {
        await addUserRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL USER ROLES
  app.route("/user-roles").get(
    checkPermission("view_user_roles"),
    async (req, res, next) => {
      try {
        await getAllUserRolesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET USER ROLE BY ID
  app.route("/user-roles/:id").get(
    checkPermission("view_user_roles"),
    async (req, res, next) => {
      try {
        await getUserRoleByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE USER ROLE
  app.route("/user-roles/:id").put(
    checkPermission("update_user_role"),
    async (req, res, next) => {
      try {
        await updateUserRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE USER ROLE
  app.route("/user-roles/:id").delete(
    checkPermission("delete_user_role"),
    async (req, res, next) => {
      try {
        await deleteUserRoleController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default userRole;
