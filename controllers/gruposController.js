const Categorias = require("../models/Categorias");
const Grupos = require("../models/Grupos");
const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");
const uuid = require("uuid/v4");

const configuracionMulter = {
  limits: { fileSize: 150000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, next) => {
      next(null, __dirname + "/../public/uploads/grupos/");
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split("/")[1];
      next(null, `${shortid.generate()}.${extension}`);
    }
  })),
  fileFilter(req, file, next) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      next(null, true);
    } else {
      next(new Error("Formato no valido "), false);
    }
  }
};
const upload = multer(configuracionMulter).single("imagen");

exports.subirImagen = (req, res, next) => {
  upload(req, res, function(error) {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El Archivo es demasiado grande max 150MB");
        } else {
          req.flash("error", error.message);
        }
      } else if (error.hasOwnProperty("message")) {
        req.flash("error", error.message);
      }
      return res.redirect("back");
    } else {
      next();
    }
  });
};

exports.formNuevosGrupos = async (req, res) => {
  const categorias = await Categorias.findAll();
  res.render("nuevo-grupo", {
    nombrePagina: "Crea un Nuevo Grupo",
    categorias
  });
};
exports.crearGrupo = async (req, res) => {
  //TODO: Me falto hacer codigo para sanitizar
  const nuevoGrupo = req.body;
  nuevoGrupo.usuarioId = req.user.id;
  nuevoGrupo.categoriaId = req.body.categoria;
  if (req.file) {
    nuevoGrupo.imagen = req.file.filename;
  }
  nuevoGrupo.id = uuid();
  try {
    await Grupos.create(nuevoGrupo);
    req.flash("exito", "Se ha creado el grupo correctamente");
    res.redirect("/administracion");
  } catch (error) {
    const erroresSequelize = error.errors.map(err => err.message);
    req.flash("error", erroresSequelize);
    res.redirect("/nuevo-grupo");
  }
};

exports.editarGrupo = async (req, res) => {
  const consultas = [];
  consultas.push(Grupos.findByPk(req.params.grupoId));
  consultas.push(Categorias.findAll());
  const [grupo, categorias] = await Promise.all(consultas);
  res.render("editar-grupo", {
    nombrePagina: `Editar Grupo: ${grupo.nombre}`,
    categorias,
    grupo
  });
};

exports.actualizarGrupo = async (req, res) => {
  const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

  if (!grupo) {
    req.flash("error", "Operacion NO Valida");
    res.redirect("/administracion");
    return next();
  }

  const { nombre, descripcion, categoriaId, url } = req.body;

  grupo.nombre = nombre;
  grupo.descripcion = descripcion;
  grupo.categoriaId = categoriaId;
  grupo.url = url;
  await grupo.save();
  req.flash("exito", "La informacion del grupo se actulizado correctamente");
  res.redirect("/administracion");
};

exports.formImagenGrupo = async (req, res) => {
  const grupo = await Grupos.findByPk(req.params.grupoId);
  if (!grupo) {
    req.flash("error", "Operacion NO Valida");
    res.redirect("/administracion");
    return next();
  }
  res.render("imagen-grupo", {
    nombrePagina: `Editar Imagen Grupo : ${grupo.nombre}`,
    grupo
  });
};

exports.actualizarImagenGrupo = async (req, res) => {
  const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });
  if (!grupo) {
    req.flash("error", "Operacion NO Valida");
    res.redirect("/administracion");
    return next();
  }

  if (req.file && grupo.imagen) {
    const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
    fs.unlink(imagenAnteriorPath, error => {
      if (error) {
        console.log(error);
      }
      return;
    });
  }
  if (req.file) {
    grupo.imagen = req.file.filename;
  }

  await grupo.save();
  req.flash("exito", "Cambios Almacenados Correctamente");
  res.redirect("/administracion");
};

exports.formEliminarImagenGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });
  if (!grupo) {
    req.flash("error", "Operacion NO Válida");
    res.redirect("/administracion");
    return next();
  }
  res.render("eliminar-grupo", {
    nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
  });
};
exports.eliminarGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });
  if (!grupo) {
    req.flash("error", "Operacion NO Válida");
    res.redirect("/administracion");
    return next();
  }
  if (grupo.imagen) {
    const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
    fs.unlink(imagenAnteriorPath, error => {
      if (error) {
        console.log(error);
      }
      return;
    });
  }
  await Grupos.destroy({ where: { id: req.params.grupoId } });
  req.flash("exito", "Grupo Eliminado Correctamente");
  res.redirect("/administracion");
};
