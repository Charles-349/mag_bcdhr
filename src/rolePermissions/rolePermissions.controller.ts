import { Request, Response } from "express";
import {
  assignPermissionToRoleService,
  getRolePermissionsService,
  getRolePermissionsByRoleService,
  removePermissionFromRoleService,
  getEmployeePermissionsService,
  getRolePermissionByIdService,
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

//GET ROLE PERMISSION BY ID
export const getRolePermissionByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const rolePermission = await getRolePermissionByIdService(id);
    return res.status(200).json({ message: "Role permission retrieved successfully", rolePermission });
  } catch (error: any) {
    console.error("Error retrieving role permission by ID:", error);
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

// GET ALL PERMISSIONS OF AN EMPLOYEE THROUGH THEIR ROLES
export const getEmployeePermissionsController = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const permissions = await getEmployeePermissionsService(employeeId);
    return res.status(200).json({ message: "Employee permissions retrieved successfully", permissions });
  } catch (error: any) {
    console.error("Error retrieving employee permissions:", error);
    return res.status(500).json({ message: error.message });
  }
};
