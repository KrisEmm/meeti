const Grupos = require("../models/Grupos");
const Meetis = require("../models/Meetis");
const uuid = require("uuid/v4");

exports.formNuevosMeetis = async (req, res) => {
  const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });
  res.render("nuevo-meeti", {
    nombrePagina: "Crear Nuevo Meeti",
    grupos
  });
};

exports.crearMeeti = async (req, res) => {
  //TODO: falta codigo para  sanitizar
  const meeti = req.body;
  const point = {
    type: "Point",
    coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]
  };
  meeti.ubicacion = point;
  meeti.usuarioId = req.user.id;
  meeti.id = uuid();
  if (req.body.cupo === "") {
    meeti.cupo = 0;
  }
  try {
    await Meetis.create(meeti);
    req.flash("exito", "Meeti creado correctamente");
    res.redirect("/administracion");
  } catch (error) {
    console.log(error);
    const erroresSequelize = error.errors.map(err => err.message);
    req.flash("error", erroresSequelize);
    res.redirect("/nuevo-meeti");
  }
};

exports.formEditarMeeti = async (req, res) => {
  const consultas = [];
  consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }));
  consultas.push(Meetis.findByPk(req.params.id));
  const [grupos, meeti] = await Promise.all(consultas);
  res.render("editar-meeti", {
    nombrePagina: `Editar Meeti : ${meeti.titulo}`,
    grupos,
    meeti
  });
};

exports.actualizarMeeti = async (req, res, next) => {
  const meeti = await Meetis.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!meeti) {
    req.flash("error", "Operacion NO Válida");
    res.redirect("/administracion");
    return next();
  }
  const {
    grupoId,
    titulo,
    invitado,
    fecha,
    hora,
    cupo,
    descripcion,
    direccion,
    ciudad,
    estado,
    pais,
    lat,
    lng
  } = req.body;

  meeti.grupoId = grupoId;
  meeti.titulo = titulo;
  meeti.inivitado = invitado;
  meeti.fecha = fecha;
  meeti.hora = hora;
  meeti.cupo = cupo;
  meeti.descripcion = descripcion;
  meeti.direccion = direccion;
  meeti.ciudad = ciudad;
  meeti.estado = estado;
  meeti.pais = pais;

  const point = { type: "Point", coordinates: [parseFloat(lat), parseFloat(lng)] };
  meeti.ubicacion = point;

  await meeti.save();
  req.flash("exito", "Cambios Guardados Correctamente");
  res.redirect("/administracion");
};

exports.formEliminarMeeti = async (req, res) => {
  const meeti = await Meetis.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

  if (!meeti) {
    req.flash("error", "Operacion NO Válida");
    res.redirect("/administracion");
    return next();
  }
  res.render("eliminar-meeti", {
    nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
  });
};

exports.eliminarMeeti = async (req, res) => {
  const meeti = await Meetis.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!meeti) {
    req.flash("error", "Operacion NO Válida");
    res.redirect("/administracion");
    return next();
  }
  await meeti.destroy({ where: { id: req.params.id } });

  req.flash("exito", "Meeti Eliminado Correctamente");
  res.redirect("/administracion");
};
