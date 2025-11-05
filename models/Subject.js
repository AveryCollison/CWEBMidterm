import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Subject = sequelize.define("Subject", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, unique: true },
  name: DataTypes.STRING,
});

export default Subject;
