const Meetis = require("../../models/Meetis");
const Usuarios = require("../../models/Usuarios");
const Grupos = require("../../models/Grupos");
const Categorias = require("../../models/Categorias");
const Comentarios = require("../../models/Comentarios");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res, next) => {
  const meeti = await Meetis.findOne({
    where: {
      slug: req.params.slug
    },
    include: [
      {
        model: Grupos
      },
      {
        model: Usuarios,
        atrributes: ["id", "nombre", "imagen"]
      }
    ]
  });

  if (!meeti) {
    res.redirect("/");
  }
  const ubicacion = Sequelize.literal(
    `ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`
  );
  const distancia = Sequelize.fn("ST_distancesphere", Sequelize.col("ubicacion"), ubicacion);

  const meetisCercanos = await Meetis.findAll({
    order: distancia,
    where: Sequelize.where(distancia, { [Op.lte]: 3000 }),
    offset: 1,
    limit: 3,
    include: [
      {
        model: Grupos
      },
      {
        model: Usuarios,
        atrributes: ["id", "nombre", "imagen"]
      }
    ]
  });
  const comentarios = await Comentarios.findAll({
    where: { meetiId: meeti.id },
    include: [
      {
        model: Usuarios,
        attributes: ["id", "nombre", "imagen"]
      }
    ]
  });
  console.log(meetisCercanos);
  res.render("mostrar-meeti", {
    nombrePagina: meeti.titulo,
    meeti,
    meetisCercanos,
    comentarios,
    moment
  });
};

exports.confirmarAsistencia = async (req, res) => {
  const { accion } = req.body;
  if (accion === "asistir") {
    await Meetis.update(
      {
        interesados: Sequelize.fn("array_append", Sequelize.col("interesados"), req.user.id)
      },
      { where: { slug: req.params.slug } }
    );
    res.send("Haz Confirmado tu Asistencia, Gracias");
  } else {
    Meetis.update(
      {
        interesados: Sequelize.fn("array_remove", Sequelize.col("interesados"), req.user.id)
      },
      { where: { slug: req.params.slug } }
    );
    res.send("Haz Cancelado tu Asistencia");
  }
};

exports.verAsistentes = async (req, res) => {
  const meeti = await Meetis.findOne({
    where: {
      slug: req.params.slug
    },
    attributes: ["interesados"]
  });

  const { interesados } = meeti;

  const asistentes = await Usuarios.findAll({
    attributes: ["nombre", "imagen"],
    where: { id: interesados }
  });
  res.render("asistentes-meeti", {
    nombrePagina: `Listado de Asistentes`,
    asistentes,
    slug: req.params.slug
  });
};

exports.mostrarCategoria = async (req, res, next) => {
  const categoria = await Categorias.findOne({
    atrtibutes: ["id"],
    where: { slug: req.params.categoria }
  });
  const meetis = await Meetis.findAll({
    order: [
      ["fecha", "ASC"],
      ["hora", "ASC"]
    ],
    include: [
      {
        model: Grupos,
        where: { categoriaId: categoria.id }
      },
      {
        model: Usuarios
      }
    ]
  });

  res.render("categoria", {
    nombrePagina: `Categoria: ${categoria.nombre}`,
    meetis,
    moment
  });
};
