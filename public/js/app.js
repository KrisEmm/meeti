import { OpenStreetMapProvider } from "leaflet-geosearch";
import asistencia from "./asistencia";
import eliminarComentario from "./eliminar-comentario";

const latitud = document.querySelector("#lat").value;
const longitud = document.querySelector("#lng").value;
const direccion = document.querySelector("#direccion").value || "";
let lat = latitud || 0;
let lng = longitud || 0;
const zoom = 15;

const geocodeService = L.esri.Geocoding.geocodeService();
const provider = new OpenStreetMapProvider();
let map = L.map("mapa").setView([lat, lng], zoom);
let markers = new L.FeatureGroup().addTo(map);
let marker;

let ubicacion = new Promise((resolve, reject) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(posicion => {
      resolve(posicion);
    });
  } else {
    reject("Api Geolocalizacion NO disponible en tu Navegador");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (lat === 0 && lng === 0) {
    ubicacion
      .then(resultado => {
        console.log(resultado);
        lat = resultado.coords.latitude;
        lng = resultado.coords.longitude;
        map.setView([lat, lng], zoom);
        marker = new L.marker([lat, lng], {
          draggable: true,
          autoPan: true
        })
          .addTo(map)
          .bindPopup("Esta es tu ubicacion Actual")
          .openPopup();

        markers.addLayer(marker);
      })
      .catch(error => {
        console.log(error);
      });
  }

  if (latitud != 0 && longitud != 0) {
    marker = new L.marker([lat, lng], {
      draggable: true,
      autoPan: true
    })
      .addTo(map)
      .bindPopup(direccion)
      .openPopup();

    markers.addLayer(marker);
    marker.on("moveend", function(e) {
      marker = e.target;
      const posicion = marker.getLatLng();
      map.panTo(new L.LatLng(posicion.lat, posicion.lng));
      geocodeService
        .reverse()
        .latlng(posicion, 15)
        .run(function(error, result) {
          llenarInputs(result);
          marker.bindPopup(result.address.LongLabel);
        });
    });
  }

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  const buscador = document.querySelector("#formbuscador");
  buscador.addEventListener("input", buscarDireccion);
});

function buscarDireccion(e) {
  if (e.target.value.length > 8) {
    if (marker) {
      markers.clearLayers();
    }

    provider.search({ query: e.target.value }).then(resultado => {
      geocodeService
        .reverse()
        .latlng(resultado[0].bounds[0], 15)
        .run(function(error, result) {
          llenarInputs(result);
          map.setView(resultado[0].bounds[0], 15);

          marker = new L.marker(resultado[0].bounds[0], {
            draggable: true,
            autoPan: true
          })
            .addTo(map)
            .bindPopup(resultado[0].label)
            .openPopup();

          markers.addLayer(marker);

          marker.on("moveend", function(e) {
            marker = e.target;
            const posicion = marker.getLatLng();
            map.panTo(new L.LatLng(posicion.lat, posicion.lng));
            geocodeService
              .reverse()
              .latlng(posicion, 15)
              .run(function(error, result) {
                llenarInputs(result);
                marker.bindPopup(result.address.LongLabel);
              });
          });
        });
    });
  }
}

function llenarInputs(resultado) {
  document.querySelector("#direccion").value = resultado.address.Address || "";
  document.querySelector("#ciudad").value = resultado.address.City || "";
  document.querySelector("#estado").value = resultado.address.Region || "";
  document.querySelector("#pais").value = resultado.address.CountryCode || "";
  document.querySelector("#lat").value = resultado.latlng.lat || "";
  document.querySelector("#lng").value = resultado.latlng.lng || "";
}
