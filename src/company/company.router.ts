import { Express } from "express";
import {
  addCompanyController,
  getCompaniesController,
  getCompanyByIdController,
  updateCompanyController,
  deleteCompanyController,
  getCompanyByNameController,
} from "./company.controller";

import { checkPermission } from "../middleware/bearAuth";

const company = (app: Express) => {

  // CREATE COMPANY
  app.route("/companies").post(
    checkPermission("create_company"),
    async (req, res, next) => {
      try {
        await addCompanyController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET ALL COMPANIES
  app.route("/companies").get(
    checkPermission("view_company"),
    async (req, res, next) => {
      try {
        await getCompaniesController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET COMPANY BY ID
  app.route("/companies/:id").get(
    checkPermission("view_company"),
    async (req, res, next) => {
      try {
        await getCompanyByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET COMPANY BY NAME
  app.route("/companies/name/:name").get(
    checkPermission("view_company"),
    async (req, res, next) => {
      try {
        await getCompanyByNameController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // UPDATE COMPANY
  app.route("/companies/:id").put(
    checkPermission("update_company"),
    async (req, res, next) => {
      try {
        await updateCompanyController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE COMPANY
  app.route("/companies/:id").delete(
    checkPermission("delete_company"),
    async (req, res, next) => {
      try {
        await deleteCompanyController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

};

export default company;
