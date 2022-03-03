const Usuarios = require("../models/Usuarios");
const passport = require("passport");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/administracion",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios"
});

exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/iniciar-sesion");
};

exports.cerrarSesion = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  req.logout();
  req.flash("exito", `Adiós ${usuario.nombre}, Hasta la Proxima`);
  res.redirect("/iniciar-sesion");
};
