// routes/dashboard.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { Particular } from '../models/Particular';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

const router:Router = express.Router();

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview with totals
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 */
router.get('/overview', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    // Get all particulars for the user
    const particulars = await Particular.find({ createdBy: userId });

    // Calculate totals
    const totalIncoming = particulars.reduce((sum, p) => sum + p.totalIncoming, 0);
    const totalOutgoing = particulars.reduce((sum, p) => sum + p.totalOutgoing, 0);
    const totalCash = particulars.reduce((sum, p) => sum + p.totalCash, 0);
    const totalAssets = particulars.reduce((sum, p) => sum + p.totalAssets, 0);

    // Get recent transactions
    const recentTransactions = await Transaction.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('particularId', 'name')
      .populate('createdBy', 'username');

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: {
            type: '$transactionType',
            flow: '$transactionFlow'
          },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Monthly transaction summary
    const monthlyStats = await Transaction.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            flow: '$transactionFlow'
          },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    return res.json({
      overview: {
        totalIncoming,
        totalOutgoing,
        totalCash,
        totalAssets,
        netPosition: totalIncoming - totalOutgoing,
        totalParticulars: particulars.length
      },
      recentTransactions,
      transactionStats,
      monthlyStats
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/dashboard/particulars-summary:
 *   get:
 *     summary: Get summary of all particulars
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Particulars summary data
 */
router.get('/particulars-summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const particulars = await Particular.find({ createdBy: userId })
      .sort({ totalIncoming: -1 })
      .select('name totalIncoming totalOutgoing totalCash totalAssets');

    const summary = particulars.map(particular => ({
      id: particular._id,
      name: particular.name,
      totalIncoming: particular.totalIncoming,
      totalOutgoing: particular.totalOutgoing,
      totalCash: particular.totalCash,
      totalAssets: particular.totalAssets,
      netPosition: particular.totalIncoming - particular.totalOutgoing
    }));

    return res.json({
      particulars: summary,
      totals: {
        totalIncoming: summary.reduce((sum, p) => sum + p.totalIncoming, 0),
        totalOutgoing: summary.reduce((sum, p) => sum + p.totalOutgoing, 0),
        totalCash: summary.reduce((sum, p) => sum + p.totalCash, 0),
        totalAssets: summary.reduce((sum, p) => sum + p.totalAssets, 0)
      }
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get analytics data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'quarter':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    // Daily transaction volume
    const dailyStats = await Transaction.aggregate([
      { 
        $match: { 
          createdBy: userId,
          createdAt: dateFilter
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            flow: '$transactionFlow'
          },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Transaction type distribution
    const typeDistribution = await Transaction.aggregate([
      { 
        $match: { 
          createdBy: userId,
          createdAt: dateFilter
        } 
      },
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Top particulars by transaction volume
    const topParticulars = await Transaction.aggregate([
      { 
        $match: { 
          createdBy: userId,
          createdAt: dateFilter
        } 
      },
      {
        $group: {
          _id: '$particularId',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'particulars',
          localField: '_id',
          foreignField: '_id',
          as: 'particular'
        }
      },
      {
        $project: {
          name: { $arrayElemAt: ['$particular.name', 0] },
          count: 1,
          total: 1
        }
      }
    ]);

    return res.json({
      period,
      dailyStats,
      typeDistribution,
      topParticulars
    });
  } catch (error) {
    return next(error);
  }
});

export default router;