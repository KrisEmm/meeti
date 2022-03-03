const emails = require("../handlers/emails");
const { body, validationResult } = require("express-validator");
const Usuarios = require("../models/Usuarios");
const fs = require("fs");
const multer = require("multer");
const shortid = require("shortid");

const configuracionMulter = {
  limits: { fileSize: 150000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, next) => {
      next(null, __dirname + "/../public/uploads/perfiles/");
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
  upload(req, res, function (error) {
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
exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crear Cuenta"
  });
};

exports.validacionFormCrearCuenta = [
  body("confirmar", "La confirmacion de tu password no puede ir vacia").notEmpty(),

  body("confirmar", "passwordConfirmation field must have the same value as the password field")
    .exists()
    .custom((value, { req }) => value === req.body.password)
];

exports.crearNuevaCuenta = async (req, res) => {
  const errExp = validationResult(req).array();

  const usuario = req.body;
  try {
    await Usuarios.create(usuario);
    const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
    console.log(url)
    if (process.env.SMTP_ACTIVE === "true") {
      await emails.enviarEmail({
        usuario,
        subject: "Confirma tu cuenta de Meeti",
        url,
        archivo: "confirmar-cuenta"
      });
      req.flash("exito", "hemos enviado un email confirma tu cuenta");
      res.redirect("/iniciar-sesion");
      return
    } else {
      res.redirect(`/confirmar-cuenta/${usuario.email}`);
    }
  } catch (error) {
    console.log(error);
    let erroresSequelize = [];
    if (error.name === "SequelizeUniqueConstraintError") {
      erroresSequelize.push("Ese email ya existe");
    } else {
      erroresSequelize = error.errors.map(err => err.message);
    }

    const erroresExpressValidator = errExp.map(err => err.msg);

    const listaErrores = [...erroresSequelize, ...erroresExpressValidator];
    console.log(erroresSequelize);
    req.flash("error", listaErrores);
    res.redirect("/crear-cuenta");
  }
};

exports.formIniciarSesion = (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesión"
  });
};

exports.confirmarCuenta = async (req, res, next) => {
  const usuario = await Usuarios.findOne({ where: { email: req.params.correo } });

  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.redirect("/crear-cuenta");
    return next();
  }

  usuario.activo = 1;
  await usuario.save();
  req.flash("exito", "Tu cuenta se a confirmado correctamente es hora de Iniciar Sesión");
  res.redirect("/iniciar-sesion");
};

exports.formEditarPerfil = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.user.id);

  res.render("editar-perfil", {
    nombrePagina: `Editar Perfil: ${usuario.nombre}`,
    usuario
  });
};

exports.editarPerfil = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  const { nombre, descripcion, email } = req.body;

  usuario.nombre = nombre;
  usuario.descripcion = descripcion;
  usuario.email = email;

  await usuario.save();
  req.flash("exito", "Cambios Guardados Correctamente");
  res.redirect("/administracion");
};

exports.formNuevoPassword = (req, res) => {
  res.render("nuevo-password", {
    nombrePagina: "Nuevo Password"
  });
};

exports.nuevoPassword = async (req, res, next) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  const { anterior, nuevo, confirmar } = req.body;

  if (!usuario.validarPassword(anterior)) {
    req.flash("error", "Tu password actual no es el Correcto");
    res.redirect("/nuevo-password");
    return next();
  }
  if (nuevo != confirmar) {
    req.flash("error", "Tu nuevo password y la confirmacion no coinciden intentalo de nuevo");
    res.redirect("/nuevo-password");
    return next();
  }

  usuario.password = usuario.hashNuevoPassword(nuevo);
  await usuario.save();
  req.logout();
  req.flash("exito", "Tu Password ha sido Modificado Correctamente, Vuelve a Iniciar Sesión");
  res.redirect("/iniciar-sesion");
};

exports.formImagenPerfil = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  res.render("imagen-perfil", {
    nombrePagina: `Imagen Perfil: ${usuario.nombre}`,
    usuario
  });
};

exports.imagenPerfil = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.user.id);

  if (req.file && usuario.imagen) {
    const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
    fs.unlink(imagenAnteriorPath, error => {
      if (error) {
        console.log(error);
      }
      return;
    });
  }
  if (req.file) {
    usuario.imagen = req.file.filename;
  }

  await usuario.save();
  req.user.imagen = usuario.imagen;
  req.flash("exito", "Cambios Almacenados Correctamente");
  res.redirect("/administracion");
};
