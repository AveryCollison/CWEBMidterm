import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  studentName: DataTypes.STRING,
  tutorSlotId: { type: DataTypes.INTEGER, allowNull: false },
  tutorName: DataTypes.STRING,
  subjectId: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  start: { type: DataTypes.STRING, allowNull: false },
  end: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "booked" },
});

export default Booking;
