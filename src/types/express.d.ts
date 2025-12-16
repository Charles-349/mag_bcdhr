import { TIUser } from "../Drizzle/schema"; 

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        employeeId: number;
        companyId: number;
        email?: string;
      };
    }
  }
}
