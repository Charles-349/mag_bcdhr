import { Request, Response } from "express";
import {
  addPermissionService,
  getPermissionsService,
  getPermissionByIdService,
  updatePermissionService,
  deletePermissionService,
} from "./permissions.service";

// CREATE PERMISSION
export const addPermissionController = async (req: Request, res: Response) => {
  try {
    const result = await addPermissionService(req.body);
    return res.status(201).json({ message: result });
  } catch (error: any) {
    console.error("Error creating permission:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL PERMISSIONS
export const getPermissionsController = async (_req: Request, res: Response) => {
  try {
    const permissions = await getPermissionsService();
    return res.status(200).json({ message: "Permissions retrieved successfully", permissions });
  } catch (error: any) {
    console.error("Error retrieving permissions:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET PERMISSION BY ID
export const getPermissionByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const permission = await getPermissionByIdService(id);
    if (!permission) return res.status(404).json({ message: "Permission not found" });
    return res.status(200).json({ message: "Permission retrieved successfully", permission });
  } catch (error: any) {
    console.error("Error retrieving permission:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE PERMISSION
export const updatePermissionController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updatePermissionService(id, req.body);
    if (!result) return res.status(404).json({ message: "Permission not found" });
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("Error updating permission:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE PERMISSION
export const deletePermissionController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deletePermissionService(id);
    if (!result) return res.status(404).json({ message: "Permission not found" });
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("Error deleting permission:", error);
    return res.status(500).json({ message: error.message });
  }
};
