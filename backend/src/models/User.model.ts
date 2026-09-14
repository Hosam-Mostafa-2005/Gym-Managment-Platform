import { Schema, model } from "mongoose";
import { Roles } from "../constants/roles.js";
import type { Role } from "../constants/roles.js";
import bcrypt from "bcrypt";
import type { Model, HydratedDocument } from "mongoose";

export interface IUserMethods {
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
}

export interface IUser {
  name: string;
  email: string;
  password: string;

  role: Role;
  isActive: boolean;

  phone?: string;

  bio?: string | null;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, {}, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.MEMBER,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // ==========================
    // Trainer Profile
    // ==========================

    bio: {
      type: String,
      trim: true,
      default: null,
    },

    specialties: {
      type: [String],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export interface IUserModel extends Model<IUser, {}, IUserMethods> {}

userSchema.index({
  role: 1,
  isActive: 1,
});

const User = model<IUser, IUserModel>("User", userSchema);

export default User;
