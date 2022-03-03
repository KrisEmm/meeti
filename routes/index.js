const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const gruposController = require("../controllers/gruposController");
const meetisController = require("../controllers/meetisController");
const meetisControllerFE = require("../controllers/frontend/meetisControllerFE");
const usuariosControllerFE = require("../controllers/frontend/usuariosControllerFE");
const gruposControllerFE = require("../controllers/frontend/GruposControllerFE");
const comentariosControllerFE = require("../controllers/frontend/comentariosControllerFE");
const busquedaControllerFE = require("../controllers/frontend/busquedaControllerFE");

module.exports = function() {
  router.get("/", homeController.home);
  router.get("/busqueda", busquedaControllerFE.resultadosBusqueda);
  router.get("/meeti/:slug", meetisControllerFE.mostrarMeeti);

  router.get("/asistentes/:slug", meetisControllerFE.verAsistentes);

  router.post("/confirmar-asistencia/:slug", meetisControllerFE.confirmarAsistencia);

  router.get("/grupos/:id", gruposControllerFE.mostrarGrupo);

  router.get("/usuarios/:id", usuariosControllerFE.mostrarUsuario);
  router.get("/categoria/:categoria", meetisControllerFE.mostrarCategoria);

  router.post("/meeti/:id", comentariosControllerFE.agregarComentario);
  router.post("/eliminar-comentario", comentariosControllerFE.eliminarComentario);

  router.get("/crear-cuenta", usuariosController.formCrearCuenta);
  router.post(
    "/crear-cuenta",
    usuariosController.validacionFormCrearCuenta,
    usuariosController.crearNuevaCuenta
  );
  router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);
  router.get("/confirmar-cuenta/:correo", usuariosController.confirmarCuenta);

  router.get(
    "/administracion",
    authController.usuarioAutenticado,
    adminController.panelAdministracion
  );

  router.get("/cerrar-sesion", authController.usuarioAutenticado, authController.cerrarSesion);
  // ------------------Grupos
  router.get("/nuevo-grupo", authController.usuarioAutenticado, gruposController.formNuevosGrupos);

  router.post(
    "/nuevo-grupo",
    authController.usuarioAutenticado,
    gruposController.subirImagen,
    gruposController.crearGrupo
  );
  router.get(
    "/editar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.editarGrupo
  );
  router.post(
    "/editar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.actualizarGrupo
  );
  router.get(
    "/imagen-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.formImagenGrupo
  );
  router.post(
    "/imagen-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.subirImagen,
    gruposController.actualizarImagenGrupo
  );
  router.get(
    "/eliminar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.subirImagen,
    gruposController.formEliminarImagenGrupo
  );
  router.post(
    "/eliminar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.eliminarGrupo
  );
  // Meeti´s
  router.get("/nuevo-meeti", authController.usuarioAutenticado, meetisController.formNuevosMeetis);
  router.post("/nuevo-meeti", authController.usuarioAutenticado, meetisController.crearMeeti);
  router.get(
    "/editar-meeti/:id",
    authController.usuarioAutenticado,
    meetisController.formEditarMeeti
  );
  router.post(
    "/editar-meeti/:id",
    authController.usuarioAutenticado,
    meetisController.actualizarMeeti
  );
  router.get(
    "/eliminar-meeti/:id",
    authController.usuarioAutenticado,
    meetisController.formEliminarMeeti
  );
  router.post(
    "/eliminar-meeti/:id",
    authController.usuarioAutenticado,
    meetisController.eliminarMeeti
  );
  // Perfiles
  router.get(
    "/editar-perfil",
    authController.usuarioAutenticado,
    usuariosController.formEditarPerfil
  );
  router.post("/editar-perfil", authController.usuarioAutenticado, usuariosController.editarPerfil);
  router.get(
    "/nuevo-password",
    authController.usuarioAutenticado,
    usuariosController.formNuevoPassword
  );
  router.post(
    "/nuevo-password",
    authController.usuarioAutenticado,
    usuariosController.nuevoPassword
  );
  router.get(
    "/imagen-perfil",
    authController.usuarioAutenticado,
    usuariosController.formImagenPerfil
  );
  router.post(
    "/imagen-perfil",
    authController.usuarioAutenticado,
    usuariosController.subirImagen,
    usuariosController.imagenPerfil
  );
  return router;
};
