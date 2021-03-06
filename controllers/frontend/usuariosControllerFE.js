const Usuarios = require("../../models/Usuarios");
const Grupos = require("../../models/Grupos");

exports.mostrarUsuario = async (req, res) => {
  const consultas = [];
  consultas.push(Usuarios.findByPk(req.params.id));
  consultas.push(Grupos.findAll({ where: { usuarioId: req.params.id } }));

  const [usuario, grupos] = await Promise.all(consultas);
  if (!usuario) {
    res.redirect("/");
    return next();
  }
  res.render("info-usuario", {
    nombrePagina: `Informacion del Autor:  ${usuario.nombre}`,
    usuario,
    grupos
  });
};
