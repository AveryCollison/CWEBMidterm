import { Booking, TutorSlot, Subject } from "../models/index.js";

export const studentController = {
  async mySessions(req, res) {
    const bookings = await Booking.findAll({
      where: { studentId: req.user.sub },
      include: [
        {
          model: TutorSlot,
          as: "slot",
          include: [{ model: Subject, as: "subject" }],
        },
      ],
      order: [
        ["date", "ASC"],
        ["start", "ASC"],
      ],
    });

    const sessions = bookings.map((b) => {
      const plain = b.get({ plain: true });
      plain.subjectName = plain.slot?.subject?.name || "Unknown";
      return plain;
    });

    res.render("sessions", { title: "My Sessions", sessions });
  },

  async availability(req, res) {
    const openSlots = await TutorSlot.findAll({
      where: { booked: false },
      include: [{ model: Subject, as: "subject" }],
      order: [
        ["date", "ASC"],
        ["start", "ASC"],
      ],
    });

    const slots = openSlots.map(slot => {
      const plain = slot.get({ plain: true });
      plain.subjectName = plain.subject?.name || "Unknown";
      return plain;
    });

    res.render("availability", { title: "Available Slots", slots });
  },

  async bookSlot(req, res) {
    const slot = await TutorSlot.findByPk(req.params.slotId, {
      include: [{ model: Subject, as: "subject" }],
    });

    if (!slot)
      return res
        .status(404)
        .render("error", { title: "Not Found", message: "Slot not found." });

    if (slot.booked)
      return res.status(400).render("error", {
        title: "Already Booked",
        message: "This slot is already booked.",
      });

    await Booking.create({
      studentId: req.user.sub,
      studentName: req.user.name,
      tutorSlotId: slot.id,
      tutorName: slot.tutorName,
      subjectId: slot.subjectId,
      date: slot.date,
      start: slot.start,
      end: slot.end,
      status: "booked",
    });

    slot.booked = true;
    await slot.save();

    res.redirect("/my/sessions");
  },
};
