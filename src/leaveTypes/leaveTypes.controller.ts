import { Request, Response } from "express";
import {
  createLeaveTypeService,
  getLeaveTypesService,
  getLeaveTypeByIdService,
  updateLeaveTypeService,
  deleteLeaveTypeService,
} from "./leaveTypes.service";

// CREATE LEAVE TYPE
export const createLeaveTypeController = async (req: Request, res: Response) => {
  try {
    const leaveType = await createLeaveTypeService(req.body);

    return res.status(201).json({
      message: "Leave type created successfully",
      leaveType,
    });
  } catch (error: any) {
    console.error("Error creating leave type:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL LEAVE TYPES
export const getLeaveTypesController = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const list = await getLeaveTypesService(search as string);

    return res.status(200).json({
      message: "Leave types retrieved successfully",
      leaveTypes: list,
    });
  } catch (error: any) {
    console.error("Error retrieving leave types:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET LEAVE TYPE BY ID
export const getLeaveTypeByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const record = await getLeaveTypeByIdService(id);

    if (!record) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    return res.status(200).json({
      message: "Leave type retrieved successfully",
      leaveType: record,
    });
  } catch (error: any) {
    console.error("Error fetching leave type by ID:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE LEAVE TYPE
export const updateLeaveTypeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateLeaveTypeService(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    return res.status(200).json({
      message: "Leave type updated successfully",
      leaveType: updated,
    });
  } catch (error: any) {
    console.error("Error updating leave type:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE LEAVE TYPE
export const deleteLeaveTypeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteLeaveTypeService(id);

    if (!deleted) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    return res.status(200).json({
      message: "Leave type deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting leave type:", error);
    return res.status(500).json({ message: error.message });
  }
};
