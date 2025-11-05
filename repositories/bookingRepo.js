import { Booking, TutorSlot, Subject } from "../models/index.js";

export const bookingRepo = {
  findByStudentId(studentId) {
    return Booking.findAll({
      where: { studentId },
      include: [
        {
          model: TutorSlot,
          as: "slot",
          include: [{ model: Subject, as: "subject" }],
        },
      ],
      order: [["date", "ASC"], ["start", "ASC"]],
    });
  },

  create(data) {
    return Booking.create(data);
  }
};
