const inputFoto = document.getElementById("input-foto");
const inputCamara = document.getElementById("input-camara");
const imagen = document.getElementById("imagen");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const placeholder = document.getElementById("placeholder");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");

let modelo = null;
let cargandoModelo = false;

async function cargarModelo() {
  if (modelo || cargandoModelo) return;
  cargandoModelo = true;
  estado.textContent = "Cargando modelo de detección...";
  try {
    modelo = await cocoSsd.load();
    estado.textContent = "Modelo listo. Elige una foto.";
  } catch (e) {
    console.error(e);
    estado.textContent = "Error al cargar el modelo. Revisa la conexión.";
  } finally {
    cargandoModelo = false;
  }
}

function mostrarFoto(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Elige un archivo de imagen.");
    return;
  }

  const url = URL.createObjectURL(file);
  imagen.onload = async () => {
    placeholder.hidden = true;
    imagen.hidden = true;
    canvas.hidden = false;

    // Ajustar canvas al tamaño de la imagen (limitado para no ir muy lento)
    const maxAncho = 640;
    const escala = Math.min(1, maxAncho / imagen.naturalWidth);
    canvas.width = Math.round(imagen.naturalWidth * escala);
    canvas.height = Math.round(imagen.naturalHeight * escala);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);

    await contarPersonas();
  };
  imagen.src = url;
}

async function contarPersonas() {
  if (!modelo) {
    await cargarModelo();
    if (!modelo) return;
  }

  estado.textContent = "Analizando imagen...";
  resultado.textContent = "Personas estimadas: ...";

  try {
    const predicciones = await modelo.detect(canvas);

    // Solo personas con confianza razonable
    const personas = predicciones.filter(
      (p) => p.class === "person" && p.score >= 0.5
    );

    // Dibujar cajas
    ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#22c55e";
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#22c55e";

    personas.forEach((p) => {
      const [x, y, w, h] = p.bbox;
      ctx.strokeRect(x, y, w, h);
    });

    resultado.textContent = "Personas estimadas: " + personas.length;
    estado.textContent =
      personas.length === 0
        ? "No se detectaron personas con suficiente claridad."
        : "Detección terminada (aproximada).";
  } catch (e) {
    console.error(e);
    resultado.textContent = "Personas estimadas: —";
    estado.textContent = "Error al analizar la imagen.";
  }
}

inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  if (file) mostrarFoto(file);
});

inputCamara.addEventListener("change", () => {
  const file = inputCamara.files[0];
  if (file) mostrarFoto(file);
});

// Precargar el modelo al abrir la app
cargarModelo();
