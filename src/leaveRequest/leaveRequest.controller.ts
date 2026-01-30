import { Request, Response } from "express";
import {
  addLeaveRequestService,
  getLeaveRequestsService,
  getLeaveRequestByIdService,
  getLeaveRequestsByEmployeeIdService,
  getLeaveRequestsByCompanyIdService,
  updateLeaveRequestService,
  deleteLeaveRequestService,
  decideLeaveRequestService,
  getLeaveRequestsForManagerCommentService,
} from "./leaveRequest.service";

// CREATE LEAVE REQUEST
export const addLeaveRequestController = async (req: Request, res: Response) => {
  try {
    const applyingEmployeeId = req.body.employeeId;
    if (!applyingEmployeeId)
      return res.status(400).json({ message: "employeeId is required" });

    const leaveRequest = await addLeaveRequestService(req.body, applyingEmployeeId);
    return res.status(201).json({ message: "Leave request created successfully", leaveRequest });
  } catch (error: any) {
    console.error("Error creating leave request:", error);
    return res.status(400).json({ message: error.message });
  }
};

// export const addLeaveRequestController = async (
//   req: Request & { user?: any },
//   res: Response
// ) => {
//   try {
//     const applyingEmployeeId = req.user?.employeeId;

//     if (!applyingEmployeeId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const leaveRequest = await addLeaveRequestService(
//       req.body,
//       applyingEmployeeId
//     );

//     return res.status(201).json({
//       message: "Leave request created successfully",
//       leaveRequest,
//     });
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return res.status(400).json({ message: error.message });
//     }
//   }
// };


// GET ALL LEAVE REQUESTS
export const getLeaveRequestsController = async (_req: Request, res: Response) => {
  try {
    const leaveRequests = await getLeaveRequestsService();
    return res.status(200).json({ message: "Leave requests retrieved successfully", leaveRequests });
  } catch (error: any) {
    console.error("Error retrieving leave requests:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET LEAVE REQUEST BY ID
export const getLeaveRequestByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const leaveRequest = await getLeaveRequestByIdService(id);
    if (!leaveRequest) return res.status(404).json({ message: "Leave request not found" });

    return res.status(200).json({ message: "Leave request retrieved successfully", leaveRequest });
  } catch (error: any) {
    console.error("Error retrieving leave request:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET LEAVE REQUESTS BY EMPLOYEE
export const getLeaveRequestsByEmployeeController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const leaveRequests = await getLeaveRequestsByEmployeeIdService(employeeId);
    return res.status(200).json({ message: "Leave requests retrieved successfully", leaveRequests });
  } catch (error: any) {
    console.error("Error retrieving leave requests by employee:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET LEAVE REQUESTS BY COMPANY
export const getLeaveRequestsByCompanyController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const leaveRequests = await getLeaveRequestsByCompanyIdService(companyId);
    return res.status(200).json({ message: "Leave requests retrieved successfully", leaveRequests });
  } catch (error: any) {
    console.error("Error retrieving leave requests by company:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE LEAVE REQUEST
export const updateLeaveRequestController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateLeaveRequestService(id, req.body);
    if (!updated) return res.status(404).json({ message: "Leave request not found" });

    return res.status(200).json({ message: updated });
  } catch (error: any) {
    console.error("Error updating leave request:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE LEAVE REQUEST
export const deleteLeaveRequestController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteLeaveRequestService(id);
    if (!result) return res.status(404).json({ message: "Leave request not found" });

    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("Error deleting leave request:", error);
    return res.status(500).json({ message: error.message });
  }
};

// APPROVE LEAVE REQUEST
// export const decideLeaveRequestController = async (req: Request, res: Response) => {
//   try {
//     const leaveRequestId = Number(req.params.id);
//     const approverEmployeeId = Number(req.user?.employeeId || req.body.employeeId);

//     if (!approverEmployeeId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { action, comment, totalDays } = req.body;

//     if (!["approve", "reject", "comment"].includes(action)) {
//       return res.status(400).json({ message: "Invalid action" });
//     }

//     const result = await decideLeaveRequestService(
//       leaveRequestId,
//       approverEmployeeId,
//       action as "approve" | "reject" | "comment",
//       comment,
//       totalDays
//     );

//     return res.status(200).json(result);
//   } catch (error: any) {
//     return res.status(400).json({ message: error.message });
//   }
// };

// GET LEAVE REQUESTS FOR MANAGER COMMENTS
export const getLeaveRequestsForManagerCommentController = async (req: Request, res: Response) => {
  try {
    const managerEmployeeId = Number(req.user?.employeeId);
    const companyId = Number(req.user?.companyId);

    if (!managerEmployeeId || !companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await getLeaveRequestsForManagerCommentService(managerEmployeeId, companyId);

    if (requests.length === 0) {
      return res.status(200).json({ 
        requests: [],
        message: "No pending leave requests for your departments at the moment."
      });
    }

    return res.status(200).json({ requests });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


export const decideLeaveRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    //Get authenticated employee ID (from middleware)
    const approverEmployeeId = req.user?.employeeId;

    if (!approverEmployeeId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //Validate leave request ID
    const leaveRequestId = Number(req.params.id);
    if (isNaN(leaveRequestId)) {
      return res.status(400).json({ message: "Invalid leave request ID" });
    }

    //Extract action, comment, and totalDays
    const { action, comment, totalDays } = req.body;

    if (!["approve", "reject", "comment"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    //Call service
    const result = await decideLeaveRequestService(
      leaveRequestId,
      approverEmployeeId,
      action as "approve" | "reject" | "comment",
      comment,
      totalDays
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Leave decision error:", error);

    // Conflict: already approved/rejected
    if (
      error.message.includes("already approved") ||
      error.message.includes("already rejected")
    ) {
      return res.status(409).json({ message: error.message });
    }

    // Insufficient leave balance
    if (error.message.includes("Insufficient leave balance")) {
      return res.status(422).json({ message: error.message });
    }

    // Previous step missing
    if (error.message.includes("Previous approval step")) {
      return res.status(400).json({ message: error.message });
    }

    // Default fallback
    return res.status(400).json({ message: error.message || "Something went wrong" });
  }
};