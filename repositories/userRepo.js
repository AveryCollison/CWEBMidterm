import { User } from "../models/index.js";

export const userRepo = {
  findByEmail(email) {
    return User.findOne({ where: { email } });
  },

  findById(id) {
    return User.findOne({ where: { id } });
  },

  findAll() {
    return User.findAll();
  },

  create(data) {
    return User.create(data);
  }
};
