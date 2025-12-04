
import { Request, Response } from "express";
import {
  addUserRoleService,
  getAllUserRolesService,
  getUserRoleByIdService,
  updateUserRoleService,
  deleteUserRoleService
} from "./userRole.service";

export const addUserRoleController = async (req: Request, res: Response) => {
  try {
    const { employeeId, roleId } = req.body;

    const result = await addUserRoleService(employeeId, roleId);

    res.status(201).json({ message: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllUserRolesController = async (req: Request, res: Response) => {
  try {
    const result = await getAllUserRolesService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserRoleByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await getUserRoleByIdService(id);

    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateUserRoleController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { roleId } = req.body;

    const result = await updateUserRoleService(id, roleId);

    res.json({ message: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUserRoleController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await deleteUserRoleService(id);

    res.json({ message: result });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};
