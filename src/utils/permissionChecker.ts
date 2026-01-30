import { Request, Response, NextFunction } from "express";

interface UserWithPermissions {
  id: number;
  employeeId: number;
  companyId: number;
  email?: string;
  permissions?: string[];
}

interface RequestWithUser extends Request {
  user?: UserWithPermissions;
}

export const checkApproveOrComment = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
      console.log("REQ.USER:", req.user);
  console.log("PERMISSIONS:", req.user?.permissions);

  const userPermissions: string[] = req.user?.permissions || [];

  if (
    userPermissions.includes("approve_leave_request") ||
    userPermissions.includes("comment_leave_request")
  ) {
    return next();
  }

  return res.status(403).json({ message: "You do not have permission" });
};
