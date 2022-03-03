import axios from "axios";

document.addEventListener("DOMContentLoaded", () => {
  const asistencia = document.querySelector("#confimar-asistencia");
  if (asistencia) {
    asistencia.addEventListener("submit", confirmarAsistencia);
  }
});

function confirmarAsistencia(e) {
  e.preventDefault();
  const btn = document.querySelector('#confirmar-asistencia input[type="submit"]');
  let accion = document.querySelector("#accion").value;
  const mensaje = document.querySelector("#mensaje");
  while (mensaje.firstChild) {
    mensaje.removeChild(mensaje.firstChild);
  }
  const datos = {
    accion
  };
  axios.post(this.action, datos).then(respuesta => {
    if (accion === "asistir") {
      document.querySelector("#accion").value = "cancelar";
      btn.value = "cancelar";
      btn.classList.remove("btn-azul");
      btn.classList.add("btn-rosa");
    } else {
      document.querySelector("#accion").value = "asistir";
      btn.value = "asistir";
      btn.classList.remove("btn-rosa");
      btn.classList.add("btn-azul");
    }
    console.log(respuesta.data);
    mensaje.appendChild(document.createTextNode(respuesta.data));
  });
}
