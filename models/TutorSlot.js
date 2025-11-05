import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TutorSlot = sequelize.define("TutorSlot", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tutorId: { type: DataTypes.INTEGER, allowNull: false },
  tutorName: { type: DataTypes.STRING, allowNull: false },
  subjectId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  start: { type: DataTypes.STRING, allowNull: false },
  end: { type: DataTypes.STRING, allowNull: false },
  booked: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default TutorSlot;
