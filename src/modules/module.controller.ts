import { Request, Response } from "express";
import {
  createModuleService,
  getAllModulesService,
  getModuleByIdService,
  updateModuleService,
  deleteModuleService
} from "./module.service";

// CREATE MODULE
export const createModuleController = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.name) {
      return res.status(400).json({ message: "Module name is required" });
    }

    const module = await createModuleService(data);

    return res.status(201).json({
      message: "Module created successfully",
      module,
    });
  } catch (error: any) {
    console.error("Error creating module:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL MODULES
export const getAllModulesController = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const modules = await getAllModulesService(search);

    return res.status(200).json({
      message: "Modules retrieved successfully",
      modules,
    });
  } catch (error: any) {
    console.error("Error fetching modules:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET MODULE BY ID
export const getModuleByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const module = await getModuleByIdService(id);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    return res.status(200).json({
      message: "Module retrieved successfully",
      module,
    });
  } catch (error: any) {
    console.error("Error fetching module:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE MODULE
export const updateModuleController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;

    const updated = await updateModuleService(id, data);

    if (!updated) {
      return res.status(404).json({ message: "Module not found" });
    }

    return res.status(200).json({
      message: "Module updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating module:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE MODULE
export const deleteModuleController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await deleteModuleService(id);

    if (!deleted) {
      return res.status(404).json({ message: "Module not found" });
    }

    return res.status(200).json({
      message: "Module deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting module:", error);
    return res.status(500).json({ message: error.message });
  }
};
