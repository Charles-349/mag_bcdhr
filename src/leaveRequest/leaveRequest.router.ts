import { Express } from "express";
import {
  addLeaveRequestController,
  getLeaveRequestsController,
  getLeaveRequestByIdController,
  getLeaveRequestsByEmployeeController,
  getLeaveRequestsByCompanyController,
  updateLeaveRequestController,
  deleteLeaveRequestController,
  decideLeaveRequestController,
} from "./leaveRequest.controller";

import { checkPermission } from "../middleware/bearAuth";

const leaveRequest = (app: Express) => {
  // CREATE LEAVE REQUEST
  app.route("/leave-requests").post(
    // checkPermission("create_leave_request", { allowBootstrap: true }),
    async (req, res, next) => {
      try {
        await addLeaveRequestController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL LEAVE REQUESTS
  app.route("/leave-requests").get(
    checkPermission("view_leave_request"),
    async (req, res, next) => {
      try {
        await getLeaveRequestsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET LEAVE REQUEST BY ID
  app.route("/leave-requests/:id").get(
    checkPermission("view_leave_request"),
    async (req, res, next) => {
      try {
        await getLeaveRequestByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET LEAVE REQUESTS BY EMPLOYEE ID
  app.route("/leave-requests/employee/:employeeId").get(
    checkPermission("view_leave_request"),
    async (req, res, next) => {
      try {
        await getLeaveRequestsByEmployeeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET LEAVE REQUESTS BY COMPANY ID
  app.route("/leave-requests/company/:companyId").get(
    checkPermission("view_leave_request"),
    async (req, res, next) => {
      try {
        await getLeaveRequestsByCompanyController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE LEAVE REQUEST
  app.route("/leave-requests/:id").put(
    checkPermission("update_leave_request"),
    async (req, res, next) => {
      try {
        await updateLeaveRequestController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE LEAVE REQUEST
  app.route("/leave-requests/:id").delete(
    checkPermission("delete_leave_request"),
    async (req, res, next) => {
      try {
        await deleteLeaveRequestController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // APPROVE LEAVE REQUEST
  app.route("/leave-requests/:id/decision").post(
    checkPermission("approve_leave_request"),
    async (req, res, next) => {
      try {
        await decideLeaveRequestController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default leaveRequest;
