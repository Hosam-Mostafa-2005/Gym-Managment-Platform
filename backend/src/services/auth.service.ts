import User from "../models/User.model.js";
import type { RegisterDto } from "../types/auth.types.js";
import AppError from "../utils/AppError.js";
import type { LoginDto } from "../types/auth.types.js";
import generateToken from "../utils/generateToken.js";
import mapUser from "../mappers/user.mapper.js";
import type { UserDocument } from "../models/User.model.js";
import type { UpdatePasswordDto } from "../types/auth.types.js";

class AuthService {
  async register(userData: RegisterDto) {
    const existingUser = await User.findOne({
      email: userData.email,
    });

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const user = await User.create(userData);
    const token = generateToken(user.id);

    return {
      user: mapUser(user),
      token,
    };
  }

  async login(userData: LoginDto) {
    const user = await User.findOne({
      email: userData.email,
      isActive: true,
    }).select("+password");

    if (!user) {
      throw new AppError("Incorrect email or password", 401);
    }

    const correct = await user.correctPassword(
      userData.password,
      user.password,
    );

    if (!correct) {
      throw new AppError("Incorrect email or password", 401);
    }

    const token = generateToken(user.id);
    return {
      user: mapUser(user),
      token,
    };
  }

  async logout() {
    return;
  }

  async getMe() {}

  async updatePassword(currentUser: UserDocument, data: UpdatePasswordDto) {
    const user = await User.findById(currentUser.id).select("+password");

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const correct = await user.correctPassword(
      data.currentPassword,
      user.password,
    );

    if (!correct) {
      throw new AppError("Current password is incorrect.", 401);
    }

    user.password = data.newPassword;

    await user.save();

    const token = generateToken(user.id);

    return {
      user: mapUser(user),
      token,
    };
  }
}

export default new AuthService();
