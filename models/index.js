import User from "./User.js";
import Subject from "./Subject.js";
import TutorSlot from "./TutorSlot.js";
import Booking from "./Booking.js";

// relationships
User.hasMany(TutorSlot, { foreignKey: "tutorId", as: "slots" });
TutorSlot.belongsTo(User, { foreignKey: "tutorId", as: "tutor" });

Subject.hasMany(TutorSlot, { foreignKey: "subjectId", as: "slots" });
TutorSlot.belongsTo(Subject, { foreignKey: "subjectId", as: "subject" });

User.hasMany(Booking, { foreignKey: "studentId", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "studentId", as: "student" });

TutorSlot.hasOne(Booking, { foreignKey: "tutorSlotId", as: "booking" });
Booking.belongsTo(TutorSlot, { foreignKey: "tutorSlotId", as: "slot" });

export { User, Subject, TutorSlot, Booking };
