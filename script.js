const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

dibujarEjes();
dibujarGrilla();

/**
 * Dibuja los ejes cartesianos en el lienzo.
 */
function dibujarEjes() {
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0); //donde empieza eje y
  ctx.lineTo(canvas.width / 2, canvas.height); //donde termina eje y
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.strokeStyle = "black";
  ctx.stroke();
}

/**
 * Dibuja la grilla en el lienzo.
 */
function dibujarGrilla() {
  for (let i = -20; i <= 20; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 30 + canvas.width / 2, 0);
    ctx.lineTo(i * 30 + canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * 30 + canvas.height / 2);
    ctx.lineTo(canvas.width, i * 30 + canvas.height / 2);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    if (i !== 0) {
      // dibuja la escala tanto de y como de x, pero no el 0
      ctx.fillStyle = "black";
      ctx.fillText(i, i * 30 + canvas.width / 2 - 4, canvas.height / 2 + 12);
      ctx.fillText(-i, canvas.width / 2 + 4, i * 30 + canvas.height / 2 + 6);
    }
  }
  ctx.fillStyle = "red";
  ctx.fillText("0", canvas.width / 2 - 8, canvas.height / 2 + 12);
}

/**
 * Sustituye los patrones de la función.
 * @param {string} funcion - La función a la que se le reemplazarán los patrones.
 * @returns {string} - La función con los patrones reemplazados.
 */
function sustituirPatrones(funcion) {
  funcion = funcion.replace(/(\d.?\d+)x/g, "$1*x");
  funcion = funcion.toString().replace(/(\d*\.?\d*)x\^2/g, "$1*(x^2)");
  funcion = funcion.toString().replace(/(\d*\.?\d+)x/g, "$1*x");
  return funcion;
}

/**
 * Evalúa la función en un valor dado.
 * @param {number} x - El valor de entrada para evaluar la función.
 * @param {string} tipo - El tipo de función a evaluar.
 * @param {string} funcion - La función a evaluar.
 * @returns {number} - El resultado de evaluar la función en el valor dado.
 */
function evaluarFuncion(x, tipo, funcion) {
  funcion = sustituirPatrones(funcion);

  console.log(funcion);
  console.log(x);
  let resultado = 0;
  switch (tipo) {
    case "sin":
      resultado = Math.sin(eval(funcion));
      return resultado;
    case "cos":
      resultado = Math.cos(eval(funcion));
      return resultado;
    case "tg":
      resultado = Math.tan(eval(funcion));
      return resultado;
    case "log":
      let log_x = eval(funcion);
      if (log_x <= 0) {
        resultado = NaN;
        return resultado;
      } else {
        resultado = Math.log(log_x) / Math.log(Math.E);
        return resultado;
      }
    case "ln":
      let ln_x = eval(funcion);
      if (ln_x <= 0) {
        resultado = NaN;
        return resultado;
      } else {
        resultado = Math.log(ln_x);
        return resultado;
      }
    case "lineal":
      resultado = eval(funcion);
      return resultado;
    case "cuadratica":
      resultado = eval(funcion);
      return resultado;

    case "hiperbolica":
      resultado = Math.sinh(eval(funcion));
      return resultado;
    default:
      // Evaluar la expresión con math.js
      resultado = eval(funcion, { x: eval(funcion) });
      return resultado;
  }
}
/**
 * Dibuja la gráfica de la función en el lienzo.
 */
function dibujarGrafica() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  dibujarEjes();
  dibujarGrilla();

  const funcionInput = document.getElementById("funcion").value;
  const tipoInput = document.getElementById("tipo").value;

  // Dibujar la gráfica de la función
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  let xAnterior = -10;
  let yAnterior = evaluarFuncion(xAnterior, tipoInput, funcionInput);
  let x = -9.9;

  function animarLinea() {
    // Evaluar la función con math.js
    const y = evaluarFuncion(x, tipoInput, funcionInput);

    ctx.moveTo(xAnterior * 100 + 400, -yAnterior * 100 + 400);
    ctx.lineTo(x * 100 + 400, -y * 100 + 400);
    ctx.stroke();

    xAnterior = x;
    yAnterior = y;
    x += 0.05;

    if (x <= 10) {
      requestAnimationFrame(animarLinea);
    }
  }

  requestAnimationFrame(animarLinea);
}
// Escucha el evento de clic en el botón "Graficar" y llama a la función dibujarGrafica.
document.getElementById("graficar").addEventListener("click", dibujarGrafica);
