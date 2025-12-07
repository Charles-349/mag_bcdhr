import { Request, Response } from "express";
import {
  createLeaveTypeService,
  getLeaveTypesService,
  getLeaveTypeByIdService,
  updateLeaveTypeService,
  deleteLeaveTypeService,
  getLeaveTypesByCompanyIdWithSearchService,
  getLeaveTypesByCompanyIdService,
  getLeaveTypeByNameAndCompanyService,
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

//GET LEAVE TYPE BY NAME FOR A COMPANY
export const getLeaveTypeByNameAndCompanyController = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const companyId = Number(req.params.companyId);
    const record = await getLeaveTypeByNameAndCompanyService(name, companyId);

    if (!record) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    return res.status(200).json({
      message: "Leave type retrieved successfully",
      leaveType: record,
    });
  } catch (error: any) {
    console.error("Error fetching leave type by name and company:", error);
    return res.status(500).json({ message: error.message });
  }
};

//GET LEAVE TYPES BY COMPANY ID
export const getLeaveTypesByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const records = await getLeaveTypesByCompanyIdService(companyId);

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No leave types found for this company" });
    }

    return res.status(200).json({
      message: "Leave types retrieved successfully",
      leaveTypes: records,
    });
  } catch (error: any) {
    console.error("Error fetching leave types by company ID:", error);
    return res.status(500).json({ message: error.message });
  }
};

//GET LEAVE TYPES BY COMPANY ID WITH SEARCH
export const getLeaveTypesByCompanyIdWithSearchController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const search = req.query.search as string;
    const records = await getLeaveTypesByCompanyIdWithSearchService(companyId, search);

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No leave types found for this company with the given search criteria" });
    }

    return res.status(200).json({
      message: "Leave types retrieved successfully",
      leaveTypes: records,
    });
  } catch (error: any) {
    console.error("Error fetching leave types by company ID with search:", error);
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
