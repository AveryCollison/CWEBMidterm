import { TutorSlot, Subject, User } from "../models/index.js";

export const tutorSlotRepo = {
  findByTutorId(tutorId) {
    return TutorSlot.findAll({
      where: { tutorId },
      include: [{ model: Subject, as: "subject" }]
    });
  },

  findAvailable() {
    return TutorSlot.findAll({
      where: { booked: false },
      include: [{ model: Subject, as: "subject" }],
      order: [["date", "ASC"], ["start", "ASC"]],
    });
  },

  create(data) {
    return TutorSlot.create(data);
  },

  findById(id) {
    return TutorSlot.findByPk(id, {
      include: [{ model: Subject, as: "subject" }]
    });
  },

  findOwnedSlot(slotId, tutorId) {
    return TutorSlot.findOne({ where: { id: slotId, tutorId } });
  },

  delete(slot) {
    return slot.destroy();
  }
};
