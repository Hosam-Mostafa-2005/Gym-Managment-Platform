import type { ParsedQs } from "qs";
import User from "../models/User.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import mapUser from "../utils/user.mapper.js"; // نفس المابر اللي بتستعمله في الـ auth

class UserService {
  async getAll(query: ParsedQs) {
    // بنسحب الناس الأكتيف بس، والـ ApiFeatures هتهندل فلتر الـ role والـ pagination
    const features = new ApiFeatures(User.find({ isActive: true }), query)
      .filter()
      .search(["name", "email"])
      .sort()
      .paginate();

    const users = await features.query;

    return users.map(mapUser);
  }
}

export default new UserService();
