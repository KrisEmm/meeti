const Sequilize = require("sequelize");
const db = require("../config/db");
const Categorias = require("../models/Categorias");
const Usuarios = require("../models/Usuarios");
const uuid = require("uuid/v4");

const Grupos = db.define("grupos", {
  id: {
    type: Sequilize.UUID,
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: Sequilize.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "El grupo debe tener un nombre"
      }
    }
  },
  descripcion: {
    type: Sequilize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Coloca un descripción"
      }
    }
  },
  url: Sequilize.STRING,
  imagen: Sequilize.STRING
});

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;
