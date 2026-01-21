import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

import { getUsers, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'superadmin']),
  getUsers
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  deleteUser
);

export default router;
