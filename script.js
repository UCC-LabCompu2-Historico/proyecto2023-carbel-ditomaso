document.addEventListener("DOMContentLoaded", function () {
    var inputFuncion = document.getElementById("funcion");
    var btnGraficar = document.getElementById("graficar");
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    //Definimos variables globales para evitar problemas a la hora de interactuar con ellas. En cada funcion se sobre escriben.
    var startGridX;
    var startGridY;
    var gridSize;
    var halfGridSize;

    var isAnimating = false; // Variable para rastrear si la animación está en curso

    /**
     * Limpia el canvas y dibuja el eje cartesiano
     * @method limpiarYDibujarEjeCartesiano
     */
    function limpiarYDibujarEjeCartesiano() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dibujarGrillaYEjes();
        anadirNumerosX();
    }

    /**
     * Dibuja la grilla y los ejes cartesianos en el canvas
     * @method dibujarGrillaYEjes
     */
    function dibujarGrillaYEjes() {
        gridSize = canvas.width / 20;
        halfGridSize = gridSize / 2;
        var axisWidth = 2;

        startGridX = (canvas.width / 2) % gridSize;
        startGridY = (canvas.height / 2) % gridSize;

        ctx.beginPath();
        ctx.strokeStyle = "#ddd";

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
        ctx.strokeStyle = "#000";
        ctx.lineWidth = axisWidth;

        // Eje X
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);

        // Eje Y
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);

        ctx.stroke();
    }
    function anadirNumerosX() {
        // Añadir números al eje X positivo
        for (var x = startGridX + gridSize; x < canvas.width; x += gridSize) {
            ctx.fillText(
                ((x - canvas.width / 2) / gridSize).toFixed(1),
                x,
                canvas.height / 2 + 10,
                x + halfGridSize,
            );
        }

        // Añadir números al eje X negativo
        for (
            var x = canvas.width / 2 - gridSize - startGridX;
            x > 0;
            x -= gridSize
        ) {
            ctx.fillText(
                ((x - canvas.width / 2) / gridSize).toFixed(1),
                x,
                canvas.height / 2 + 10,
                x + halfGridSize,
            );
        }

        // Añadir números al eje Y positivo
        for (var y = startGridY + gridSize; y < canvas.height; y += gridSize) {
            ctx.fillText(
                ((canvas.height / 2 - y) / gridSize).toFixed(1),
                canvas.width / 2,
                y + 0.5 * halfGridSize,
            );
        }

        // Añadir números al eje Y negativo
        for (
            var y = canvas.height / 2 - gridSize - startGridY;
            y > 0;
            y -= gridSize
        ) {
            ctx.fillText(
                ((canvas.height / 2 - y) / gridSize).toFixed(1),
                canvas.width / 2,
                y + 0.5 * halfGridSize,
            );
        }
    }

    /**
     * Detecta el tipo de función ingresada
     * @method detectarTipoFuncion
     * @param {string} expresion - La función ingresada por el usuario
     * @return {string} Tipo de función detectada
     */
    function detectarTipoFuncion(expresion) {
        // Validar si la expresión contiene caracteres no permitidos
        var caracteresNoPermitidos = "abcdefghijklmnopqrstuvwxyzñ¡¿'?&$#!°:´¨¬";
        var caracteresPermitidos = [
            "pi",
            "e",
            "x",
            "sin",
            "cos",
            "tan",
            "sinh",
            "cosh",
            "tanh",
            "log",
        ];

        // Verificar si la expresión contiene caracteres no permitidos a nivel de funciones
        var partes = expresion.split(/[(),]/).filter(function (parte) {
            return parte.trim() !== "";
        });

        for (var i = 0; i < partes.length; i++) {
            var parte = partes[i];
            if (
                !caracteresPermitidos.includes(parte) &&
                !/^[-\d\+\*\^\/\(\)\.x]+$/.test(parte)
            ) {
                console.error("Función no válida: Caracter no permitido - " + parte);
                return "Función no válida"; // Indicar que es una función no válida
            }
        }

        try {
            var parsed = math.parse(expresion);

            if (
                parsed.isSymbolNode ||
                (parsed.isOperatorNode &&
                    parsed.op === "*" &&
                    parsed.args.length === 2 &&
                    parsed.args[1].isSymbolNode &&
                    parsed.args[1].name === "x")
            ) {
                return "Función Lineal";
            } else if (parsed.isOperatorNode) {
                return "Expresión Matemática";
            } else if (parsed.isFunctionNode) {
                // Verificar si la función es una de las funciones específicas
                var functionName = parsed.name;
                if (caracteresPermitidos.includes(functionName)) {
                    // Verificar si la función está completa
                    if (expresion.endsWith("(")) {
                        console.error(
                            "Función no válida: Función incompleta - " + functionName,
                        );
                        return "Función no válida";
                    }
                    return "Función " + functionName;
                } else {
                    console.error(
                        "Función no válida: Función no permitida - " + functionName,
                    );
                    return "Función no válida";
                }
            } else {
                return "Otro Tipo de Expresión";
            }
        } catch (error) {
            console.error("Error al analizar la función:", error);
            return "Función no válida"; // Devolver directamente que es una función no válida
        }
    }


    /**
     * Grafica la función en el canvas
     * @method graficarFuncion
     * @param {string} expresion - La función ingresada por el usuario
     */
    function graficarFuncion(expresion, callback) {
        // Limpiar el canvas antes de dibujar el nuevo gráfico
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        limpiarYDibujarEjeCartesiano();

        var gridSize = 40;
        var halfGridSize = gridSize / 2;
        var rangoX = 10; // Ajuste el rango de x según sus necesidades
        var rangoY = 10; // Ajuste el rango de y según sus necesidades

        ctx.beginPath();
        ctx.strokeStyle = "#007bff";

        var totalFrames = 60;
        var currentFrame = 0;

        var minX = Infinity;
        var maxX = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;

        function animate() {
            // Dibujar una pequeña porción en cada fotograma
            var segmentWidth = canvas.width / totalFrames;

            for (var i = 0; i < segmentWidth; i++) {
                var pantallaX = currentFrame * segmentWidth + i;
                var x = rangoX * (pantallaX / canvas.width - 0.5) * 2;

                try {
                    var y = math.evaluate(expresion, { x: x });

                    if (isNaN(y) || !isFinite(y)) {
                        continue;
                    }

                    var pantallaY =
                        canvas.height / 2 - (y / rangoY) * (canvas.height / 2);

                    // Actualizar las coordenadas extremas
                    minX = Math.min(minX, pantallaX);
                    maxX = Math.max(maxX, pantallaX);
                    minY = Math.min(minY, pantallaY);
                    maxY = Math.max(maxY, pantallaY);

                    if (
                        pantallaX >= 0 &&
                        pantallaX <= canvas.width &&
                        pantallaY >= 0 &&
                        pantallaY <= canvas.height
                    ) {
                        if (pantallaX === 0) {
                            ctx.moveTo(pantallaX, pantallaY);
                        } else {
                            ctx.lineTo(pantallaX, pantallaY);
                        }
                    }
                } catch (error) {
                    console.error("Error al evaluar la función en x =", x, ":", error);
                    // Mostrar error si la expresión no es válida
                    mostrarMensaje("La expresión no es válida.", "red");
                    return;
                }
            }

            ctx.stroke();

            currentFrame++;

            if (currentFrame < totalFrames) {
                // Continuar la animación
                requestAnimationFrame(animate);
            } else {
                // Verificar si las coordenadas extremas están dentro de los límites
                if (
                    minX < 0 ||
                    maxX > canvas.width ||
                    minY < 0 ||
                    maxY > canvas.height
                ) {
                    // Coordenadas fuera de los límites, mostrar advertencia
                    mostrarMensaje(
                        "La gráfica se extiende más allá de la zona de dibujo.",
                        "orange"
                    );
                }

                // Verificar si la expresión es válida
                try {
                    detectarTipoFuncion(expresion);
                } catch (error) {
                    // Mostrar error si la expresión no es válida
                    mostrarMensaje("La expresión no es válida.", "red");
                    return;
                }

                // La animación ha terminado, llamar al callback
                if (typeof callback === "function") {
                    callback();
                }
            }
        }

        // Iniciar la animación
        animate();
    }

    /**
     * Función para mostrar mensajes en el DOM
     * @method mostrarMensaje
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} color - Color del mensaje (opcional)
     */
    function mostrarMensaje(mensaje, color = "black") {
        // Obtener el contenedor de mensajes
        var mensajeContainer = document.getElementById("error-container");

        // Actualizar el texto y color del contenedor de mensajes
        mensajeContainer.innerHTML = mensaje;
        mensajeContainer.style.color = color;

        // Mostrar el contenedor de mensajes
        mensajeContainer.style.display = "block";

        // Ocultar el contenedor después de 5 segundos (puedes ajustar el tiempo)
        setTimeout(function () {
            mensajeContainer.style.display = "none";
        }, 5000); // 5000 milisegundos = 5 segundos
    }


    btnGraficar.addEventListener("click", function () {
        if (isAnimating) {
            // Si la animación está en curso, no hacer nada
            return;
        }

        var expresion = inputFuncion.value.trim();

        if (expresion !== "") {
            try {
                var tipoFuncion = detectarTipoFuncion(expresion);
                console.log("Tipo de función:", tipoFuncion);

                if (tipoFuncion !== "Función no válida") {
                    // Se ha detectado un tipo de función válido, ahora se puede graficar
                    isAnimating = true; // Marcar que la animación está en curso
                    graficarFuncion(expresion, function () {
                        // Callback llamado cuando la animación ha terminado
                        isAnimating = false; // Marcar que la animación ha terminado
                    });
                } else {
                    console.error("La función ingresada no es válida.");
                    mostrarError("La función ingresada no es válida.");
                }
            } catch (error) {
                console.error("Error al detectar el tipo de función:", error.message);
                mostrarError("Error al detectar el tipo de función.");
            }
        } else {
            console.error("La función ingresada no es válida.");
            mostrarError("La función ingresada no puede estar vacía.");
        }
    });

    // Función para mostrar mensajes de error en el DOM
    function mostrarError(mensaje) {
        // Obtener el contenedor de errores
        var errorContainer = document.getElementById("error-container");

        // Actualizar el texto del contenedor de errores
        errorContainer.innerHTML = mensaje;

        // Mostrar el contenedor de errores
        errorContainer.style.display = "block";

        // Ocultar el contenedor después de 5 segundos (puedes ajustar el tiempo)
        setTimeout(function () {
            errorContainer.style.display = "none";
        }, 5000); // 5000 milisegundos = 5 segundos
    }
});