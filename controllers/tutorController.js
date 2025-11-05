import { TutorSlot, Subject } from "../models/index.js";

export const tutorController = {
  async slotsPage(req, res) {
    const slots = await TutorSlot.findAll({
      where: { tutorId: req.user.sub },
      include: [{ model: Subject, as: "subject" }],
    });

    const slotsPlain = slots.map((s) => {
      const plain = s.get({ plain: true });
      plain.subjectName = plain.subject?.name || "Unknown";
      return plain;
    });

    const subjects = await Subject.findAll();

    res.render("tutor-slots", {
      title: "Tutor Slots",
      slots: slotsPlain,
      subjects: subjects.map((sj) => sj.get({ plain: true })),
    });
  },

  async createSlot(req, res) {
    const { subject: subjectId, date, start, end } = req.body;
    if (!subjectId || !date || !start || !end) {
      const slots = await TutorSlot.findAll({
        where: { tutorId: req.user.sub },
      });
      return res.status(400).render("tutor-slots", {
        title: "Tutor Slots",
        error: "All fields are required.",
        slots,
      });
    }

    await TutorSlot.create({
      tutorId: req.user.sub,
      tutorName: req.user.name,
      subjectId: parseInt(subjectId),
      date,
      start,
      end,
    });

    res.redirect("/tutor/slots");
  },

  async deleteSlot(req, res) {
    const slot = await TutorSlot.findOne({
      where: { id: req.params.id, tutorId: req.user.sub },
    });
    if (!slot) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message: "You can only delete your own slots.",
      });
    }
    await slot.destroy();
    res.redirect("/tutor/slots");
  },
};
