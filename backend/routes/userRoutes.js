import express from 'express';
import {
  registerUser,
  confirmRegistration,
  authUser,
  logoutUser,
  requestPasswordChangeVerification,
  confirmPasswordChange,
  requestAccountDeletionVerification,
  confirmAccountDeletion,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/register/confirm', confirmRegistration);
router.post('/login', authUser);
router.post('/logout', logoutUser);

router.post('/password/request-verification', authMiddleware, requestPasswordChangeVerification);
router.post('/password/confirm', authMiddleware, confirmPasswordChange);
router.post('/delete/request-verification', authMiddleware, requestAccountDeletionVerification);
router.post('/delete/confirm', authMiddleware, confirmAccountDeletion);

export default router;
