// routes/auth.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { IUser, User } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    }) as IUser;

    await user.save();

    // Generate tokens
    const token = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
   return next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        phone: req.user.phone,
        address: req.user.address,
        businessName: req.user.businessName,
        businessAddress: req.user.businessAddress,
        businessPhone: req.user.businessPhone,
        gstNumber: req.user.gstNumber,
        licenseNumber: req.user.licenseNumber,
        emailNotifications: req.user.emailNotifications,
        smsNotifications: req.user.smsNotifications,
        darkMode: req.user.darkMode,
        autoBackup: req.user.autoBackup,
        currency: req.user.currency,
        language: req.user.language,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               businessName:
 *                 type: string
 *               businessAddress:
 *                 type: string
 *               businessPhone:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               emailNotifications:
 *                 type: boolean
 *               smsNotifications:
 *                 type: boolean
 *               darkMode:
 *                 type: boolean
 *               autoBackup:
 *                 type: boolean
 *               currency:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData.role;
    delete updateData.username;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        businessName: updatedUser.businessName,
        businessAddress: updatedUser.businessAddress,
        businessPhone: updatedUser.businessPhone,
        gstNumber: updatedUser.gstNumber,
        licenseNumber: updatedUser.licenseNumber,
        emailNotifications: updatedUser.emailNotifications,
        smsNotifications: updatedUser.smsNotifications,
        darkMode: updatedUser.darkMode,
        autoBackup: updatedUser.autoBackup,
        currency: updatedUser.currency,
        language: updatedUser.language,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    return res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    return next(error);
  }
});

export default router;