document.addEventListener("DOMContentLoaded", function () {
  var inputFuncion = document.getElementById("funcion");
  var btnGraficar = document.getElementById("graficar");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  function limpiarYDibujarEjeCartesiano() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ajustar tamaño de la grilla y ejes
    var gridSize = canvas.width/ 20;  // Ajusta según sea necesario
    var halfGridSize = gridSize / 2;
    var axisWidth = 2;

    // Calcular el inicio de la grilla y del eje X e Y
    var startGridX = canvas.width / 2 % gridSize;
    var startGridY = canvas.height / 2 % gridSize;

    // Dibujar la grilla
    ctx.beginPath();
    ctx.strokeStyle = "#ddd"; // Color de la grilla

    // Dibujar líneas horizontales
    for (var i = startGridY; i < canvas.height; i += gridSize) {
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
    }

    for (var i = startGridY - gridSize; i > 0; i -= gridSize) {
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
    }

    // Dibujar líneas verticales
    for (var j = startGridX; j < canvas.width; j += gridSize) {
      ctx.moveTo(j, 0);
      ctx.lineTo(j, canvas.height);
    }

    for (var j = startGridX - gridSize; j > 0; j -= gridSize) {
      ctx.moveTo(j, 0);
      ctx.lineTo(j, canvas.height);
    }

    ctx.stroke();

    // Dibujar ejes cartesianos
    ctx.beginPath();
    ctx.strokeStyle = "#000"; // Color de los ejes
    ctx.lineWidth = axisWidth;

    // Eje X
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);

    // Eje Y
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);

    ctx.stroke();

// Añadir números al eje X positivo
    for (var x = startGridX + gridSize; x < canvas.width; x += gridSize) {
      ctx.fillText(((x - canvas.width / 2) / gridSize).toFixed(1), x, canvas.height / 2 + 10, x + halfGridSize);
    }

// Añadir números al eje X negativo
    for (var x = canvas.width / 2 - gridSize - startGridX; x > 0; x -= gridSize) {
      ctx.fillText(((x - canvas.width / 2) / gridSize).toFixed(1), x, canvas.height / 2 + 10, x + halfGridSize);
    }

// Añadir números al eje Y positivo
    for (var y = startGridY + gridSize; y < canvas.height; y += gridSize) {
      ctx.fillText(((canvas.height / 2 - y) / gridSize).toFixed(1), canvas.width / 2, y + 0.5 * halfGridSize);
    }

// Añadir números al eje Y negativo
    for (var y = canvas.height / 2 - gridSize - startGridY; y > 0; y -= gridSize) {
      ctx.fillText(((canvas.height / 2 - y) / gridSize).toFixed(1), canvas.width / 2, y + 0.5 * halfGridSize);
    }


  }

  function detectarTipoFuncion(expresion) {
    try {
      var parsed = math.parse(expresion);

      if (parsed.isSymbolNode) {
        return "Función Constante";
      } else if (parsed.isOperatorNode) {
        return "Expresión Matemática";
      } else if (parsed.isFunctionNode) {
        if (parsed.name === 'exp') {
          return "Función Exponencial";
        } else if (['sinh', 'cosh', 'tanh'].includes(parsed.name)) {
          return "Función Hiperbólica";
        } else if (['log', 'log10'].includes(parsed.name)) {
          return "Función Logarítmica";
        } else {
          return "Función " + parsed.name;
        }
      } else {
        return "Otro Tipo de Expresión";
      }
    } catch (error) {
      console.error("Error al analizar la función:", error);
      return "Función no válida: " + error.message;
    }

  }
  function graficarFuncion(expresion) {
    limpiarYDibujarEjeCartesiano();

    var gridSize = 40;
    var halfGridSize = gridSize / 2;

    var rangoX = 10; // Modificar según sea necesario
    var rangoY = 10;

    ctx.beginPath();
    ctx.strokeStyle = "#007bff";

    for (var pantallaX = 0; pantallaX < canvas.width; pantallaX++) {
      var x = rangoX * ((pantallaX / canvas.width) - 0.5) * 2;
      try {
        var y = math.evaluate(expresion, { x: x });

        if (isNaN(y) || !isFinite(y)) {
          continue; // Omitir puntos no válidos
        }

        var pantallaY = canvas.height / 2 - (y / rangoY) * (canvas.height / 2);

        if (pantallaX === 0) {
          ctx.moveTo(pantallaX, pantallaY);
        } else {
          ctx.lineTo(pantallaX, pantallaY);
        }
      } catch (error) {
        console.error("Error al evaluar la función en x =", x, ":", error);
      }
    }

    ctx.stroke();
  }


  function evaluarFuncion(x, expresion) {
    // Utilizar la biblioteca math.js para evaluar la función
    var scope = { x: x, sinh: math.sinh, cosh: math.cosh, tanh: math.tanh, log: math.log, exp: math.exp };
    return math.evaluate(expresion, scope);
  }

  btnGraficar.addEventListener("click", function () {
    var expresion = inputFuncion.value;

    if (expresion.trim() !== "") {
      var tipoFuncion = detectarTipoFuncion(expresion);
      console.log("Tipo de función:", tipoFuncion);

      if (tipoFuncion !== "Función no válida") {
        graficarFuncion(expresion);
      } else {
        console.error("La función ingresada no es válida.");
      }
    } else {
      console.error("La función ingresada no es válida.");
    }
  });

  });
