import { UserCollection, type User, type UserDocument } from "../database/models/user.js";

type CreateUserInput = Pick<User, "email" | "nickname" | "password">;

export const createUser = (userData: CreateUserInput) => {
  return UserCollection.create(userData);
};

export const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
  const normalizedEmail = email.toLowerCase().trim();

  return UserCollection.findOne({
    $or: [{ email: normalizedEmail }, { nickname: normalizedEmail }],
  });
};

export const getUserById = async (userId: string): Promise<UserDocument> => {
  const user = await UserCollection.findById(userId);

  if (!user) {
    throw new Error("User not found!");
  }

  return user;
};
