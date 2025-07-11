// routes/particulars.ts
import express, { Router } from 'express';
import { Particular } from '../models/Particular';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

const router:Router = express.Router();

/**
 * @swagger
 * /api/particulars:
 *   get:
 *     summary: Get all particulars with search and pagination
 *     tags: [Particulars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or contact number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of particulars
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { createdBy: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const particulars = await Particular.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Particular.countDocuments(query);

    return res.json({
      particulars,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/particulars/{id}:
 *   get:
 *     summary: Get a specific particular
 *     tags: [Particulars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Particular details
 *       404:
 *         description: Particular not found
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const particular = await Particular.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!particular) {
      return res.status(404).json({ error: 'Particular not found' });
    }

    return res.json(particular);
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/particulars:
 *   post:
 *     summary: Create a new particular
 *     tags: [Particulars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               identityDocument:
 *                 type: string
 *     responses:
 *       201:
 *         description: Particular created successfully
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const particular = new Particular({
      ...req.body,
      createdBy: req.user._id
    });

    await particular.save();

    return res.status(201).json({
      message: 'Particular created successfully',
      particular
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/particulars/{id}:
 *   put:
 *     summary: Update a particular
 *     tags: [Particulars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               identityDocument:
 *                 type: string
 *     responses:
 *       200:
 *         description: Particular updated successfully
 *       404:
 *         description: Particular not found
 */
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const particular = await Particular.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!particular) {
      return res.status(404).json({ error: 'Particular not found' });
    }

    return res.json({
      message: 'Particular updated successfully',
      particular
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/particulars/{id}:
 *   delete:
 *     summary: Delete a particular
 *     tags: [Particulars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Particular deleted successfully
 *       404:
 *         description: Particular not found
 */
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const particular = await Particular.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!particular) {
      return res.status(404).json({ error: 'Particular not found' });
    }

    // Also delete related transactions
    await Transaction.deleteMany({ particularId: req.params.id });

    return res.json({
      message: 'Particular deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
});

export default router;