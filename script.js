document.addEventListener("DOMContentLoaded", function () {
    const inputFuncion = document.getElementById("funcion");
    const btnGraficar = document.getElementById("graficar");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    //Definimos variables globales para evitar problemas a la hora de interactuar con ellas. En cada funcion se sobre escriben.
    let startGridX;
    let startGridY;
    let gridSize;
    let halfGridSize;

    let isAnimating = false; // Variable para rastrear si la animación está en curso

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
        let axisWidth = 2;

        startGridX = (canvas.width / 2) % gridSize;
        startGridY = (canvas.height / 2) % gridSize;

        ctx.beginPath();
        ctx.strokeStyle = "#ddd";

        // Dibujar líneas horizontales
        for (let i = startGridY; i < canvas.height; i += gridSize) {
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
        }

        for (let i = startGridY - gridSize; i > 0; i -= gridSize) {
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
        }

        // Dibujar líneas verticales
        for (let j = startGridX; j < canvas.width; j += gridSize) {
            ctx.moveTo(j, 0);
            ctx.lineTo(j, canvas.height);
        }

        for (let j = startGridX - gridSize; j > 0; j -= gridSize) {
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

    /**
     * Añade números al eje X y Y en el canvas
     * @method anadirNumerosX
     */
    function anadirNumerosX() {
        // Añadir números al eje X positivo
        for (let x = startGridX + gridSize; x < canvas.width; x += gridSize) {
            ctx.fillText(
                ((x - canvas.width / 2) / gridSize).toFixed(1),
                x,
                canvas.height / 2 + 10,
                x + halfGridSize,
            );
        }

        // Añadir números al eje X negativo
        for (
            let x = canvas.width / 2 - gridSize - startGridX;
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
        for (let y = startGridY + gridSize; y < canvas.height; y += gridSize) {
            ctx.fillText(
                ((canvas.height / 2 - y) / gridSize).toFixed(1),
                canvas.width / 2,
                y + 0.5 * halfGridSize,
            );
        }

        // Añadir números al eje Y negativo
        for (
            let y = canvas.height / 2 - gridSize - startGridY;
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
        let caracteresNoPermitidos = "abcdefghijklmnopqrstuvwxyzñ¡¿'?&$#!°:´¨¬";
        let caracteresPermitidos = [
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
            "exp"

        ];

        // Verificar si la expresión contiene caracteres no permitidos a nivel de funciones
        let partes = expresion.split(/[(),]/).filter(function (parte) {
            return parte.trim() !== "";
        });

        for (let i = 0; i < partes.length; i++) {
            let parte = partes[i];
            if (
                !caracteresPermitidos.includes(parte) &&
                !/^[-\d\+\*\^\/\(\)\.x]+$/.test(parte)
            ) {
                console.error("Función no válida: Caracter no permitido - " + parte);
                return "Función no válida"; // Indicar que es una función no válida
            }
        }

        try {
            let parsed = math.parse(expresion);

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
                let functionName = parsed.name;
                if (caracteresPermitidos.includes(functionName)) {
                    // Verificar si la función está completa
                    if (expresion.endsWith("(") && functionName !== "exp") {
                        console.error(
                            "Función no válida: Función incompleta - " + functionName,
                        );
                        return "Función no válida";
                    }
                    return "Función " + functionName;
                } else if (functionName === "exp") {
                    // Permitir la función exponencial 'exp(x)'
                    return "Función exponencial";
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
     * @param {function} callback - Función de retorno opcional al finalizar la animación
     */
    function graficarFuncion(expresion, callback) {
        // Limpiar el canvas antes de dibujar el nuevo gráfico
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        limpiarYDibujarEjeCartesiano();

        let gridSize = 40;
        let halfGridSize = gridSize / 2;
        let rangoX = 10; // Ajuste el rango de x según sus necesidades
        let rangoY = 10; // Ajuste el rango de y según sus necesidades

        ctx.beginPath();
        ctx.strokeStyle = "#007bff";

        let totalFrames = 60;
        let currentFrame = 0;

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;


        /**
         * Dibuja la animación de la función en el canvas por segmentos en cada fotograma.
         *
         * @method animate
         * @param {number} totalFrames - El número total de fotogramas para la animación.
         * @param {number} currentFrame - El fotograma actual en la animación.
         * @param {number} rangoX - El rango en el eje X para la función.
         * @param {number} rangoY - El rango en el eje Y para la función.
         * @param {number} minX - Coordenada X mínima de la función.
         * @param {number} maxX - Coordenada X máxima de la función.
         * @param {number} minY - Coordenada Y mínima de la función.
         * @param {number} maxY - Coordenada Y máxima de la función.
         * @param {string} expresion - La función matemática a graficar.
         * @param {CanvasRenderingContext2D} ctx - Contexto del canvas para dibujar.
         * @param {HTMLCanvasElement} canvas - Elemento canvas para la animación.
         * @param {function} mostrarMensaje - Función para mostrar mensajes en el DOM.
         */

        
        function animate() {
            // Dibujar una pequeña porción en cada fotograma
            let segmentWidth = canvas.width / totalFrames;

            for (let i = 0; i < segmentWidth; i++) {
                let pantallaX = currentFrame * segmentWidth + i;
                let x = rangoX * (pantallaX / canvas.width - 0.5) * 2;

                try {
                    let y = math.evaluate(expresion, { x: x });

                    if (isNaN(y) || !isFinite(y)) {
                        continue;
                    }

                    let pantallaY =
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
     * Muestra mensajes en el DOM
     * @method mostrarMensaje
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} [color=black] - Color del mensaje (opcional)
     */
    function mostrarMensaje(mensaje, color = "black") {
        // Obtener el contenedor de mensajes
        let mensajeContainer = document.getElementById("error-container");

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

        let expresion = inputFuncion.value.trim();

        if (expresion !== "") {
            try {
                let tipoFuncion = detectarTipoFuncion(expresion);
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

    /**
     * Muestra mensajes de error en el DOM
     * @method mostrarError
     * @param {string} mensaje - Mensaje de error a mostrar
     */

    function mostrarError(mensaje) {
        // Obtener el contenedor de errores
        let errorContainer = document.getElementById("error-container");

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
