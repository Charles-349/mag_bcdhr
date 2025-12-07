import { Request, Response } from "express";
import {
  addRoleService,
  getRolesService,
  getRoleByIdService,
  updateRoleService,
  deleteRoleService,
  assignPermissionsService,
  getRolePermissionsService,
  getRolesByCompanyIdService,
  getRoleByNameService,
} from "./roles.service";

// CREATE ROLE
export const addRoleController = async (req: Request, res: Response) => {
  try {
    const result = await addRoleService(req.body);
    return res.status(201).json({
      message: result,
    });
  } catch (error: any) {
    console.error("Error creating role:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL ROLES
export const getRolesController = async (_req: Request, res: Response) => {
  try {
    const roles = await getRolesService();
    return res.status(200).json({
      message: "Roles retrieved successfully",
      roles,
    });
  } catch (error: any) {
    console.error("Error retrieving roles:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ROLE BY ID
export const getRoleByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const role = await getRoleByIdService(id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json({
      message: "Role retrieved successfully",
      role,
    });
  } catch (error: any) {
    console.error("Error retrieving role:", error);
    return res.status(500).json({ message: error.message });
  }
};

//GET ROLE BY NAME
export const getRoleByNameController = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const companyId = parseInt(req.params.companyId);
    const role = await getRoleByNameService(name, companyId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json({
      message: "Role retrieved successfully",
      role,
    });
  } catch (error: any) {
    console.error("Error retrieving role:", error);
    return res.status(500).json({ message: error.message });
  }
};

//GET ROLES BY COMPANY ID
export const getRolesByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const roles = await getRolesByCompanyIdService(companyId);

    if (!roles || roles.length === 0) {
      return res.status(404).json({ message: "No roles found for this company" });
    }

    return res.status(200).json({
      message: "Roles retrieved successfully",
      roles,
    });
  } catch (error: any) {
    console.error("Error retrieving roles:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE ROLE
export const updateRoleController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateRoleService(id, req.body);

    if (!result) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json({
      message: result,
    });
  } catch (error: any) {
    console.error("Error updating role:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE ROLE
export const deleteRoleController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteRoleService(id);

    if (!result) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json({
      message: result,
    });
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ASSIGN PERMISSIONS TO ROLE
export const assignPermissionsController = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const permissionIds = req.body.permissionIds as number[];
    const result = await assignPermissionsService(roleId, permissionIds);

    return res.status(200).json({
      message: result,
    });
  } catch (error: any) {
    console.error("Error assigning permissions:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ROLE PERMISSIONS
export const getRolePermissionsController = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const permissions = await getRolePermissionsService(roleId);

    return res.status(200).json({
      message: "Permissions retrieved successfully",
      permissions,
    });
  } catch (error: any) {
    console.error("Error retrieving permissions:", error);
    return res.status(500).json({ message: error.message });
  }
};
