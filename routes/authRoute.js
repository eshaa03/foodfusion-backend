import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import {
  approveUser,
  getPendingApprovals,
  getApprovedUsers,
  getAdmins,
  getAgents,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  authMiddleware,
  roleMiddleware(["superadmin"]),
  getPendingApprovals
);

router.get(
  "/approved",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  getApprovedUsers
);

router.post(
  "/approve",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  approveUser
);

router.get(
  "/admins",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  getAdmins
);

router.get(
  "/agents",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  getAgents
);


export default router;