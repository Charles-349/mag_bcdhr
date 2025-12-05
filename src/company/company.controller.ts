import { Request, Response } from "express";
import {
  addCompanyService,
  getCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
  deleteCompanyService,
  getCompanyByNameService,
} from "./company.service";

// CREATE COMPANY
export const addCompanyController = async (req: Request, res: Response) => {
  try {
    const company = req.body;
    const result = await addCompanyService(company);
    return res.status(201).json({ message: "Company created successfully", company: result });
  } catch (error: any) {
    console.error("Error creating company:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL COMPANIES
export const getCompaniesController = async (_req: Request, res: Response) => {
  try {
    const companies = await getCompaniesService();
    return res.status(200).json({ message: "Companies retrieved successfully", companies });
  } catch (error: any) {
    console.error("Error retrieving companies:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET COMPANY BY ID
export const getCompanyByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const company = await getCompanyByIdService(id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.status(200).json({ message: "Company retrieved successfully", company });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET COMPANY BY NAME
export const getCompanyByNameController = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: "Name parameter is required" });
    const companies = await getCompanyByNameService(name);
    if (!companies || companies.length === 0)
      return res.status(404).json({ message: "No companies found matching that name" });
    return res.status(200).json({ message: "Companies retrieved successfully", companies });
  } catch (error: any) {
    console.error("Error fetching companies by name:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE COMPANY
export const updateCompanyController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateCompanyService(id, req.body);
    if (!updated) return res.status(404).json({ message: "Company not found" });
    return res.status(200).json({ message: "Company updated successfully" });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE COMPANY
export const deleteCompanyController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteCompanyService(id);
    if (!result) return res.status(404).json({ message: "Company not found" });
    return res.status(200).json({ message: "Company permanently deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting company:", error);
    return res.status(500).json({ message: error.message });
  }
};
