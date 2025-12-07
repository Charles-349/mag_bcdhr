import { Express } from "express";
import {
  createLeaveTypeController,
  getLeaveTypesController,
  getLeaveTypeByIdController,
  updateLeaveTypeController,
  deleteLeaveTypeController,
  getLeaveTypeByNameAndCompanyController,
  getLeaveTypesByCompanyIdWithSearchController,
  getLeaveTypesByCompanyIdController,
} from "./leaveTypes.controller";

import { checkPermission } from "../middleware/bearAuth";
import { getLeaveTypesByCompanyIdService } from "./leaveTypes.service";

const leaveTypes = (app: Express) => {

  // CREATE Leave Type
  app.route("/leave-types").post(
    checkPermission("create_leave_type"),
    async (req, res, next) => {
      try {
        await createLeaveTypeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET All Leave Types
  app.route("/leave-types").get(
    checkPermission("view_leave_type"),
    async (req, res, next) => {
      try {
        await getLeaveTypesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET Leave Type by ID
  app.route("/leave-types/:id").get(
    checkPermission("view_leave_type"),
    async (req, res, next) => {
      try {
        await getLeaveTypeByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //GET LEAVE TYPE BY NAME FOR A COMPANY
  app.route("/leave-types/name/:name/company/:companyId").get(
    checkPermission("view_leave_type"),
    async (req, res, next) => {
      try {
        await getLeaveTypeByNameAndCompanyController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //GET LEAVE TYPES BY COMPANY ID
  app.route("/leave-types/company/:companyId").get(
    checkPermission("view_leave_type"),
    async (req, res, next) => {
      try {
        await getLeaveTypesByCompanyIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //GET LEAVE TYPES BY COMPANY ID WITH SEARCH
  app.route("/leave-types/company/:companyId/search").get(
    checkPermission("view_leave_type"),
    async (req, res, next) => {
      try {
        await getLeaveTypesByCompanyIdWithSearchController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE Leave Type
  app.route("/leave-types/:id").put(
    checkPermission("update_leave_type"),
    async (req, res, next) => {
      try {
        await updateLeaveTypeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE Leave Type
  app.route("/leave-types/:id").delete(
    checkPermission("delete_leave_type"),
    async (req, res, next) => {
      try {
        await deleteLeaveTypeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default leaveTypes;
