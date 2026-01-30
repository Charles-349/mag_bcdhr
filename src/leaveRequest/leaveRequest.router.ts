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
  getLeaveRequestsForManagerCommentController,
} from "./leaveRequest.controller";

import { checkPermission } from "../middleware/bearAuth";
import { checkApproveOrComment } from "../utils/permissionChecker";

const leaveRequest = (app: Express) => {
  // CREATE LEAVE REQUEST
  app.route("/leave-requests").post(
    // checkPermission("create_leave_request", { allowBootstrap: true }),
    checkPermission("create_leave_request"),
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
    checkPermission("view_leave_request"),
    checkApproveOrComment,
    async (req, res, next) => {
      try {
        await decideLeaveRequestController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

// MANAGER: VIEW LEAVE REQUESTS FOR COMMENT
app.route("/leave-requests/manager/comments").get(
  checkPermission("view_team_leave_requests"),
  async (req, res, next) => {
    try {
      await getLeaveRequestsForManagerCommentController(req, res);
    } catch (error) {
      next(error);
    }
  }
);


};

export default leaveRequest;
