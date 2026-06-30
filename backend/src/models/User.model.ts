import { Schema, model } from "mongoose";
import { Roles } from "../constants/roles.js";
import type { Role } from "../constants/roles.js";
import bcrypt from "bcrypt";
import type { Model } from "mongoose";
import type { HydratedDocument } from "mongoose";

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

const User = model<IUser, IUserModel>("User", userSchema);

export default User;
