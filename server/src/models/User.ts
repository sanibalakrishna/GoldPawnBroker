// models/User.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  // Profile fields
  name?: string;
  phone?: string;
  address?: string;
  // Business fields
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  gstNumber?: string;
  licenseNumber?: string;
  // Preferences
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  darkMode?: boolean;
  autoBackup?: boolean;
  currency?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  // Profile fields
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  // Business fields
  businessName: { type: String },
  businessAddress: { type: String },
  businessPhone: { type: String },
  gstNumber: { type: String },
  licenseNumber: { type: String },
  // Preferences
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  darkMode: { type: Boolean, default: false },
  autoBackup: { type: Boolean, default: true },
  currency: { type: String, default: 'INR' },
  language: { type: String, default: 'English' },
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
