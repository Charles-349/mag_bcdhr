import { Request, Response } from "express";
import {
  createLeaveBalanceService,
  getLeaveBalanceByIdForCompanyService,
  getLeaveBalancesByEmployeeService,
  updateLeaveBalanceService,
  deleteLeaveBalanceService,
} from "./leaveBalance.service";

// CREATE
export const createLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const balance = await createLeaveBalanceService(req.body);

    return res.status(201).json({
      message: "Leave balance created successfully",
      balance,
    });
  } catch (error: any) {
    console.error("Error creating leave balance:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET by ID for a specific company
export const getLeaveBalanceByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const companyId = Number(req.user?.companyId);
    if (!companyId) {
      return res.status(400).json({ message: "Company information missing" });
    }

    const balance = await getLeaveBalanceByIdForCompanyService(id, companyId);

    if (!balance) {
      return res
        .status(404)
        .json({ message: "Leave balance not found for your company" });
    }

    return res.status(200).json({ balance });
  } catch (error: any) {
    console.error("Error fetching leave balance:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET by employee & year
export const getLeaveBalancesByEmployeeController = async (
  req: Request,
  res: Response
) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const year = Number(req.query.year) || new Date().getFullYear();

    const balances = await getLeaveBalancesByEmployeeService(
      employeeId,
      year
    );

    return res.status(200).json({ balances });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const updated = await updateLeaveBalanceService(id, req.body);
    if (!updated)
      return res.status(404).json({ message: "Leave balance not found" });

    return res.status(200).json({
      message: "Leave balance updated successfully",
      balance: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const deleted = await deleteLeaveBalanceService(id);
    if (!deleted)
      return res.status(404).json({ message: "Leave balance not found" });

    return res.status(200).json({
      message: "Leave balance deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
