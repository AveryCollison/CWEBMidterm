import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "C:/Users/Seth/Desktop/CWEB Midterm/CWEBMidterm-Seth/scheduler.db",
  logging: false,
});

export default sequelize;
