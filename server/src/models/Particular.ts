
// models/Particular.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IParticular extends Document {
  name: string;
  contactNumber?: string;
  address?: string;
  identityDocument?: string;
  totalAssets: number;
  totalCash: number;
  totalIncoming: number;
  totalOutgoing: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const particularSchema = new Schema<IParticular>({
  name: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String },
  identityDocument: { type: String },
  totalAssets: { type: Number, default: 0 },
  totalCash: { type: Number, default: 0 },
  totalIncoming: { type: Number, default: 0 },
  totalOutgoing: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

export const Particular = mongoose.model<IParticular>('Particular', particularSchema);

