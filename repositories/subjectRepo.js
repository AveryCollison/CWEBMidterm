import { Subject } from "../models/index.js";

export const subjectRepo = {
  findAll() {
    return Subject.findAll();
  },

  create(data) {
    return Subject.create(data);
  },

  findById(id) {
    return Subject.findOne({ where: { id } });
  },

  delete(id) {
    return Subject.destroy({ where: { id } });
  }
};
