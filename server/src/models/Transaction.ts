// models/Transaction.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  particularId: mongoose.Types.ObjectId;
  transactionType: 'cash' | 'metal';
  transactionFlow: 'incoming' | 'outgoing';
  quantity: number;
  rate?: number;
  percentage?: number; // Quality of metal
  total: number;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  particularId: { type: Schema.Types.ObjectId, ref: 'Particular', required: true },
  transactionType: { type: String, enum: ['cash', 'metal'], required: true },
  transactionFlow: { type: String, enum: ['incoming', 'outgoing'], required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number }, // Rate per unit (applicable for metal)
  percentage: { type: Number }, // Quality percentage (applicable for metal)
  total: { type: Number, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

