import { Request, Response } from "express";
import {
  addDepartmentService,
  getDepartmentsService,
  getDepartmentByIdService,
  getDepartmentByNameService,
  updateDepartmentService,
  deleteDepartmentService,
  getDepartmentWithEmployeesService,
} from "./department.service";

// CREATE DEPARTMENT
export const addDepartmentController = async (req: Request, res: Response) => {
  try {
    const department = req.body;
    await addDepartmentService(department);
    return res.status(201).json({ message: "Department created successfully" });
  } catch (error: any) {
    console.error("Error creating department:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL DEPARTMENTS
export const getDepartmentsController = async (_req: Request, res: Response) => {
  try {
    const departments = await getDepartmentsService();
    return res.status(200).json({ message: "Departments retrieved successfully", departments });
  } catch (error: any) {
    console.error("Error retrieving departments:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET DEPARTMENT BY ID
export const getDepartmentByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const department = await getDepartmentByIdService(id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    return res.status(200).json({ message: "Department retrieved successfully", department });
  } catch (error: any) {
    console.error("Error retrieving department:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET DEPARTMENT BY NAME
export const getDepartmentByNameController = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const departments = await getDepartmentByNameService(name);
    if (!departments || departments.length === 0)
      return res.status(404).json({ message: "No departments found matching that name" });
    return res.status(200).json({ message: "Departments retrieved successfully", departments });
  } catch (error: any) {
    console.error("Error retrieving departments by name:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE DEPARTMENT
export const updateDepartmentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateDepartmentService(id, req.body);
    if (!updated) return res.status(404).json({ message: "Department not found" });
    return res.status(200).json({ message: "Department updated successfully" });
  } catch (error: any) {
    console.error("Error updating department:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE DEPARTMENT
export const deleteDepartmentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteDepartmentService(id);
    if (!result) return res.status(404).json({ message: "Department not found" });
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting department:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET DEPARTMENT WITH EMPLOYEES
export const getDepartmentWithEmployeesController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const department = await getDepartmentWithEmployeesService(id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    return res.status(200).json({ message: "Department with employees retrieved successfully", department });
  } catch (error: any) {
    console.error("Error retrieving department with employees:", error);
    return res.status(500).json({ message: error.message });
  }
};
