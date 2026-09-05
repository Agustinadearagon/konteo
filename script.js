const inputFoto = document.getElementById("input-foto");
const inputCamara = document.getElementById("input-camara");
const imagen = document.getElementById("imagen");
const placeholder = document.getElementById("placeholder");
const resultado = document.getElementById("resultado");

function mostrarFoto(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Elige un archivo de imagen.");
    return;
  }

  const url = URL.createObjectURL(file);
  imagen.src = url;
  imagen.hidden = false;
  placeholder.hidden = true;

  // En el paso 1 todavía no contamos
  resultado.textContent = "Personas estimadas: —";
}

inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  mostrarFoto(file);
});

inputCamara.addEventListener("change", () => {
  const file = inputCamara.files[0];
  mostrarFoto(file);
});
