import type { IUser } from "../models/User.model.js";

const mapUser = (user: IUser & { _id: unknown }) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,

    // Trainer Profile
    bio: user.bio,
    specialties: user.specialties,
    certifications: user.certifications,
    yearsOfExperience: user.yearsOfExperience,
  };
};

export default mapUser;
