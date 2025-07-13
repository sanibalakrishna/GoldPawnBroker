// routes/transactions.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { ITransaction, Transaction } from '../models/Transaction';
import { IParticular, Particular } from '../models/Particular';
import { AuthRequest } from '../middleware/auth';

const router:Router= express.Router();

/**
 * @swagger
 * /api/transactions/particular/{particularId}:
 *   get:
 *     summary: Get all transactions for a particular
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: particularId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [cash, metal]
 *       - in: query
 *         name: transactionFlow
 *         schema:
 *           type: string
 *           enum: [incoming, outgoing]
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
 *         description: List of transactions
 */
router.get('/particular/:particularId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { particularId } = req.params;
    const { transactionType, transactionFlow, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if particular exists and belongs to user
    const particular = await Particular.findOne({
      _id: particularId,
      createdBy: req.user._id
    });

    if (!particular) {
      return res.status(404).json({ error: 'Particular not found' });
    }

    let query: any = { particularId };

    if (transactionType) {
      query.transactionType = transactionType;
    }

    if (transactionFlow) {
      query.transactionFlow = transactionFlow;
    }

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('particularId', 'name')
      .populate('createdBy', 'username');

    const total = await Transaction.countDocuments(query);

   return  res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
   return  next(error);
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - particularId
 *               - transactionType
 *               - transactionFlow
 *               - quantity
 *               - total
 *             properties:
 *               particularId:
 *                 type: string
 *               transactionType:
 *                 type: string
 *                 enum: [cash, metal]
 *               transactionFlow:
 *                 type: string
 *                 enum: [incoming, outgoing]
 *               quantity:
 *                 type: number
 *               rate:
 *                 type: number
 *               percentage:
 *                 type: number
 *               total:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { particularId, transactionType, transactionFlow, quantity, rate, percentage, total, description } = req.body;

    // Check if particular exists and belongs to user
    const particular = await Particular.findOne({
      _id: particularId,
      createdBy: req.user._id
    });

    if (!particular) {
      return res.status(404).json({ error: 'Particular not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      particularId,
      transactionType,
      transactionFlow,
      quantity,
      rate,
      percentage,
      total,
      description,
      createdBy: req.user._id
    });

    await transaction.save();

    // Update particular's totals
    if (transactionFlow === 'incoming') {
      particular.totalIncoming += total;
      if (transactionType === 'cash') {
        particular.totalCash += total;
      } else {
        particular.totalAssets += total;
      }
    } else {
      particular.totalOutgoing += total;
      if (transactionType === 'cash') {
        particular.totalCash -= total;
      } else {
        particular.totalAssets -= total;
      }
    }

    await particular.save();

   return  res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
   return  next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a specific transaction
 *     tags: [Transactions]
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
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    })
      .populate('particularId', 'name contactNumber')
      .populate('createdBy', 'username');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
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
 *               quantity:
 *                 type: number
 *               rate:
 *                 type: number
 *               percentage:
 *                 type: number
 *               total:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const oldTransaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!oldTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const particular = await Particular.findById(oldTransaction.particularId) as IParticular;

    // Revert old transaction from particular totals
    if (oldTransaction.transactionFlow === 'incoming') {
      particular.totalIncoming -= oldTransaction.total;
      if (oldTransaction.transactionType === 'cash') {
        particular.totalCash -= oldTransaction.total;
      } else {
        particular.totalAssets -= oldTransaction.total;
      }
    } else {
      particular.totalOutgoing -= oldTransaction.total;
      if (oldTransaction.transactionType === 'cash') {
        particular.totalCash += oldTransaction.total;
      } else {
        particular.totalAssets += oldTransaction.total;
      }
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ) as ITransaction;

    // Apply new transaction to particular totals
    if (updatedTransaction.transactionFlow === 'incoming') {
      particular.totalIncoming += updatedTransaction.total;
      if (updatedTransaction.transactionType === 'cash') {
        particular.totalCash += updatedTransaction.total;
      } else {
        particular.totalAssets += updatedTransaction.total;
      }
    } else {
      particular.totalOutgoing += updatedTransaction.total;
      if (updatedTransaction.transactionType === 'cash') {
        particular.totalCash -= updatedTransaction.total;
      } else {
        particular.totalAssets -= updatedTransaction.total;
      }
    }

    await particular.save();

   return  res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
   return next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
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
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const particular = await Particular.findById(transaction.particularId) as IParticular;

    // Revert transaction from particular totals
    if (transaction.transactionFlow === 'incoming') {
      particular.totalIncoming -= transaction.total;
      if (transaction.transactionType === 'cash') {
        particular.totalCash -= transaction.total;
      } else {
        particular.totalAssets -= transaction.total;
      }
    } else {
      particular.totalOutgoing -= transaction.total;
      if (transaction.transactionType === 'cash') {
        particular.totalCash += transaction.total;
      } else {
        particular.totalAssets += transaction.total;
      }
    }

    await particular.save();
    await Transaction.findByIdAndDelete(req.params.id);

   return  res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
   return  next(error);
  }
});

export default router;