import { Request, Response } from "express";
import {
  assignPermissionToRoleService,
  getRolePermissionsService,
  getRolePermissionsByRoleService,
  removePermissionFromRoleService,
} from "./rolePermissions.service";

// ASSIGN PERMISSION TO ROLE
export const assignPermissionToRoleController = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.body;
    const result = await assignPermissionToRoleService(roleId, permissionId);
    return res.status(201).json({ message: result });
  } catch (error: any) {
    console.error("Error assigning permission to role:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL ROLE PERMISSIONS
export const getRolePermissionsController = async (_req: Request, res: Response) => {
  try {
    const rolePermissions = await getRolePermissionsService();
    return res.status(200).json({ message: "Role permissions retrieved successfully", rolePermissions });
  } catch (error: any) {
    console.error("Error retrieving role permissions:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ROLE PERMISSIONS BY ROLE
export const getRolePermissionsByRoleController = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const rolePermissions = await getRolePermissionsByRoleService(roleId);
    return res.status(200).json({ message: "Role permissions retrieved successfully", rolePermissions });
  } catch (error: any) {
    console.error("Error retrieving role permissions by role:", error);
    return res.status(500).json({ message: error.message });
  }
};

// REMOVE PERMISSION FROM ROLE
export const removePermissionFromRoleController = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.body;
    const result = await removePermissionFromRoleService(roleId, permissionId);
    if (!result) return res.status(404).json({ message: "Permission not assigned to role" });
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("Error removing permission from role:", error);
    return res.status(500).json({ message: error.message });
  }
};
