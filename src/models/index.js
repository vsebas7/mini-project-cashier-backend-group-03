import Sequelize from "sequelize";
import config from "../config/index.js";

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
