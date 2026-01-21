import { Express } from "express";
import {
  createLeaveBalanceController,
  getLeaveBalanceByIdController,
  getLeaveBalancesByEmployeeController,
  updateLeaveBalanceController,
  deleteLeaveBalanceController,
} from "./leaveBalance.controller";

import { checkPermission } from "../middleware/bearAuth";

const leaveBalances = (app: Express) => {
  // CREATE LEAVE BALANCE
  app.route("/leave-balances").post(
    checkPermission("manage_leave_balance"),
    async (req, res, next) => {
      try {
        await createLeaveBalanceController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET LEAVE BALANCE BY ID
  app.route("/leave-balances/:id").get(
    checkPermission("view_leave_balance"),
    async (req, res, next) => {
      try {
        await getLeaveBalanceByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET LEAVE BALANCES BY EMPLOYEE & YEAR
  app.route("/leave-balances/employee/:employeeId").get(
    checkPermission("view_leave_balance"),
    async (req, res, next) => {
      try {
        await getLeaveBalancesByEmployeeController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE LEAVE BALANCE
  app.route("/leave-balances/:id").put(
    checkPermission("manage_leave_balance"),
    async (req, res, next) => {
      try {
        await updateLeaveBalanceController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE LEAVE BALANCE
  app.route("/leave-balances/:id").delete(
    checkPermission("manage_leave_balance"),
    async (req, res, next) => {
      try {
        await deleteLeaveBalanceController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );
};

export default leaveBalances;
