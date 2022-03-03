const Comentarios = require("../../models/Comentarios");
const Meetis = require("../../models/Meetis");

exports.agregarComentario = async (req, res, next) => {
  const { comentario } = req.body;

  await Comentarios.create({
    mensaje: comentario,
    usuarioId: req.user.id,
    meetiId: req.params.id
  });

  res.redirect("back");
  next();
};

exports.eliminarComentario = async (req, res, next) => {
  const { comentarioId } = req.body;
  const comentario = await Comentarios.findOne({ where: { id: comentarioId } });

  if (!comentario) {
    res.status(404).send("Operacion NO Valida");
  }
  const meeti = await Meetis.findOne({ where: { id: comentario.meetiId } });
  if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
    await Comentarios.destroy({ where: { id: comentario.id } });
    res.status(200).send("Eliminado correctamente");
  } else {
    res.status(403).send("Operacion NO Valida");
  }
};
