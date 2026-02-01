export class Sudoku {

    constructor(){
        
        // 1. Las "Herramientas" (Constantes globales de la clase)
        this.keyDownNumbers = ["1","2","3","4","5","6","7","8","9"];
        this.keyDownArrows =["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace"];
        this.normalRows = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        // 2. Los Estados del Tablero
        this.originalBoard = new Array(81).fill(0);
        this.boardData = [];
        
        //3-El elemento del DOM donde vivirá todo
        this.header = document.querySelector("#header");
        this.boardGame = document.querySelector("#boardGame");
        this.timeContainer = document.querySelector("#time");
        this.buttonBottom = document.querySelector("#button-bottom")
        this.app = document.querySelector("#sudoku-grid");
        this.app.addEventListener("keydown",(e)=> this.keydownEvent(e));
        this.app.addEventListener("focusin",(e)=> this.focusinEvent(e));
        this.app.addEventListener("focusout", (e) => this.focusoutEvent(e));
        this.app.addEventListener("click",(e)=> this.clickEvent(e));

        //4- Variables del temporizador
        this.timerInterval = null;
        this.secondsElapsed = 0;

        //5- Música
        const base = import.meta.env.BASE_URL;
        this.music = new Audio(`${base}sound/music.mp3`);
        this.click = new Audio(`${base}sound/click.mp3`);
        this.arrows = new Audio(`${base}sound/arrows.mp3`);
        this.aplausos = new Audio(`${base}sound/aplausos.mp3`);
        this.clickTablero = new Audio(`${base}sound/click-02.mp3`)


        this.music.loop = true;
    }
    //Inicia el juego y controla el estado del mismo
    initSudoku() {
        const partidaCargada = this.getGame();
    
        if (!partidaCargada) {
            console.log("Generando Sudoku nuevo...");
            let filaMezclada = this.mezclar(this.normalRows);
            for(let i = 0; i < 9; i++){
                this.originalBoard[i] = filaMezclada[i];
            }
    
            if (this.resolverSudoku(0)) {
                this.randomCells();
                this.renderBoard();
                this.saveGame();
            }
        } else {
            console.log("Partida recuperada del almacenamiento local");
        }
    }

    startGame() {
        this.click.play();
        //Transición fluida 
        this.header.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            this.header.classList.add('hidden');
            this.boardGame.classList.remove('hidden');
            this.timeContainer.classList.remove("hidden");
            this.buttonBottom.classList.remove("hidden")

            this.startTimer(this.secondsElapsed)
        
        }, 500);
        if (this.music) {
            this.music.currentTime = 0; 
            this.music.play();
        }

    }
    //Función Fisher-Yates
    mezclar(lista) {
        let listaMezclada = [];
        let listaOriginal = lista.slice();
    
        while (listaOriginal.length > 0) {
            let posicion = Math.floor(Math.random() * listaOriginal.length);
            let elemento = listaOriginal.splice(posicion, 1)[0];
            listaMezclada.unshift(elemento);
        }
        return listaMezclada;
    }
    //Método para resolver el sudoku
    resolverSudoku(indice = 0) {
        // CASO BASE: Si llegamos al índice 81, ¡hemos llenado todo el tablero!
        if (indice === 81) return true;
    
        // Si la celda ya tiene un número (porque lo pusimos con Fisher-Yates al inicio)
        // saltamos a la siguiente celda directamente.
        if (this.originalBoard[indice] !== 0) {
            return this.resolverSudoku( indice + 1);
        }
    
        // PROBAMOS NÚMEROS DEL 1 AL 9
        for (let num = 1; num <= 9; num++) {
            
            if (this.esSeguro( indice, num)) {
                this.originalBoard[indice] = num; // "Lo pongo de prueba"
    
                // Llamamos a la función para que intente llenar la siguiente celda (indice + 1)
                if (this.resolverSudoku( indice + 1)) {
                    return true; // Si el de adelante dice que todo va bien, seguimos
                }
    
                // Si el de adelante me dice "oye, aquí ya no cabe nada"...
                this.originalBoard[indice] = 0; // "BORRAMOS" (Backtrack) y probamos con el siguiente num
            }
        }
    
        return false; // Si probó del 1 al 9 y nada sirvió, avisa al de atrás
    }
    //Función de check
    esSeguro(indice, numero) {
        const filaActual = Math.floor(indice / 9);
        const colActual = indice % 9;

        //Chequeamos filas y columnas
        for (let i = 0; i < 9; i++) {
            if (this.originalBoard[filaActual * 9 + i] === numero)return false;
            if (this.originalBoard[i * 9 + colActual] === numero)return false;
        }


        //Chequeamos cuadrados 3x3
        const inicioFila = Math.floor(filaActual / 3) * 3;
        const inicioCol = Math.floor(colActual / 3) * 3;

        for (let f = 0; f < 3; f++) {
            for (let c = 0; c < 3; c++) {
                if (this.originalBoard[(inicioFila + f) * 9 + (inicioCol + c)] === numero) {
                    return false;
                }
            }
        }

        return true;
    }
    // Crea los datos para el usuario (los huecos)
    randomCells(){
        this.boardData = this.originalBoard.map(( valor, i) =>{
            let celdasVisibles= Math.random() < 0.43;
            return {
                id: i,
                valorReal: valor,
                valorMostrado: celdasVisibles ? valor : "",
                esFijo: celdasVisibles,
            }
        });
    }
    //Renderizamos el tablero
    renderBoard(){
        for(let cell of this.boardData){
            const row = Math.floor(cell.id / 9);
            const col = cell.id % 9;
            
            const blockRow = Math.floor(row / 3);
            const blockCol = Math.floor(col / 3);
            
            const isGreen = (blockRow + blockCol) % 2 === 0;
            const userColor = !cell.esFijo ? 'text-[#2B463C]' : 'text-black';
            
            const newBox = document.createElement("div");
            newBox.id = cell.id;
            const greenClass = isGreen ? 'bg-[#769949]' : '';
            newBox.className = `border border-[#805D37] flex items-center justify-center text-[35px] font-bold font-['Roboto_Slab'] aspect-square ${greenClass} ${userColor}`;
            newBox.textContent = cell.valorMostrado;
            newBox.tabIndex =  cell.esFijo ? -1 : 0;
            newBox.dataset.valorReal = cell.valorReal;
            newBox.dataset.isGreen = isGreen ? true : false
            
            this.app.appendChild(newBox)
            
        }
    }
    //Evento de teclado
    keydownEvent(e)  {
        if(!this.keyDownNumbers.includes(e.key) && !this.keyDownArrows.includes(e.key)) {return};
    
        if(e.target.tabIndex === -1) {
            if(this.keyDownNumbers.includes(e.key)){
                return
            } 
            e.target.textContent = e.target.dataset.valorReal
        }
        
        if(this.keyDownNumbers.includes(e.key)){
    
            e.target.textContent = e.key;
            e.target.dataset.valorIntroducido = e.key;
            this.saveGame();
            this.endGame();

            const indice = parseInt(e.target.id);
            this.checkResult(indice, parseInt(e.key));
    
    
        }else if(this.keyDownArrows.includes(e.key)){
            let idNumber = parseInt(e.target.id);
            let nextCell;
            switch (e.key) {
                case ("ArrowUp"):
                    this.arrows.play();
                    if (idNumber >= 9 ) { 
                        nextCell = document.getElementById(idNumber - 9);
                        nextCell.focus();
                    }
                    break;
                case ("ArrowDown"):
                    this.arrows.play();
                    if (idNumber <= 72){
                        nextCell = document.getElementById(idNumber + 9);
                        nextCell.focus();
                    }
                    break;
                case ("ArrowRight"):
                    this.arrows.play();
                    if(idNumber % 9 !== 8){
                        nextCell = document.getElementById(idNumber + 1);
                        nextCell.focus();
                    }
                    break;
                case ("ArrowLeft"):
                    this.arrows.play();
                    if(idNumber % 9 !== 0){
                        nextCell = document.getElementById(idNumber - 1);
                    nextCell.focus();
                    }            
                    break;
                case ("Backspace"):
                    this.arrows.play();
                    if(e.target.tabIndex === 0){
                        e.target.textContent = "";
                    }else{
                        return
                    }
                    
                default:
                    break;
            }; 
        }   
    }
    //Evento focusin
    focusinEvent(e) {
        let element = e.target;
        element.classList.add("border-4", "border-[#805D37]");
    }
    //Evento Focus
    focusoutEvent(e) {
        let element = e.target;
        element.classList.remove("border-4", "border-indigo-500/100");
    }
    //Evento Click
    clickEvent(e) {
        this.clickTablero.currentTime = 0;
        this.clickTablero.play();
    }
    //Check Resultados
    checkResult(indice, numero) {

        // 1. Función para leer lo que hay en una celda
        const leerCelda = (i) => {
            const element = document.getElementById(i);
            if (element.textContent === "") return 0;
            return parseInt(element.textContent);
        };
    
        // 2. Primero limpiamos errores anteriores
        for (let i = 0; i < 81; i++) {
            const el = document.getElementById(i);
            el.classList.remove("bg-[#D93718]");
        }
    
        // 3. Sacamos fila y columna de la celda actual
        const fila = Math.floor(indice / 9);
        const col = indice % 9;
    
        // CHECK FILA
        let errorFila = false;
    
        for (let c = 0; c < 9; c++) {
            const i = fila * 9 + c;
    
            if (i !== indice && leerCelda(i) === numero) {
                errorFila = true;
            }
        }
    
        if (errorFila) {
            for (let c = 0; c < 9; c++) {
                const i = fila * 9 + c;
                document.getElementById(i).classList.add("bg-[#D93718]");
            }
        }
    
        // CHECK COLUMNA
        let errorCol = false;
    
        for (let f = 0; f < 9; f++) {
            const i = f * 9 + col;
    
            if (i !== indice && leerCelda(i) === numero) {
                errorCol = true;
            }
        }
    
        if (errorCol) {
            for (let f = 0; f < 9; f++) {
                const i = f * 9 + col;
                document.getElementById(i).classList.add("bg-[#D93718]");
            }
        }
    
        // CHECK BLOQUE 3x3
        const inicioFila = Math.floor(fila / 3) * 3;
        const inicioCol = Math.floor(col / 3) * 3;
    
        let errorBloque = false;
    
        for (let f = 0; f < 3; f++) {
            for (let c = 0; c < 3; c++) {
                const i = (inicioFila + f) * 9 + (inicioCol + c);
    
                if (i !== indice && leerCelda(i) === numero) {
                    errorBloque = true;
                }
            }
        }
    
        if (errorBloque) {
            for (let f = 0; f < 3; f++) {
                for (let c = 0; c < 3; c++) {
                    const i = (inicioFila + f) * 9 + (inicioCol + c);
                    document.getElementById(i).classList.add("bg-[#D93718]");
                }
            }
        }
    }
    //Guardar el juego
    saveGame() {
        const currentBoard = this.boardData.map(cell => {
            const div = document.getElementById(cell.id);
            const valorTexto = div ? div.textContent : cell.valorMostrado
            return { ...cell, valorMostrado: valorTexto };
        });
        const gameData ={
            board: currentBoard,
            time: this.secondsElapsed,
        };
        localStorage.setItem('sudoku_save', JSON.stringify(gameData));
    }
    //Sacar el juego de localStorage
    getGame() {
        const saved = localStorage.getItem("sudoku_save");
        if (saved) {
            const gameData = JSON.parse(saved);
            this.boardData = gameData.board;
            this.secondsElapsed = gameData.time || 0; 
            
            this.app.innerHTML = "";
            this.renderBoard();
            this.updateTimerDisplay(); 
    
            return true;
        }
        return false;
    }
    //Final del juego
    endGame() {
        const celdas = Array.from(this.app.querySelectorAll('div'));
    
        const todasLlenas = celdas.every(div => div.textContent !== "");
        console.log(todasLlenas)
    
        const sinErrores = !celdas.some(div => div.classList.contains("bg-red-200"));
        console.log(sinErrores)
    
        const todoCorrecto = celdas.every(div => div.textContent === div.dataset.valorReal);
        console.log(todoCorrecto)
    
        if (todasLlenas && sinErrores && todoCorrecto) {
            this.juegoCompletado();
        }
    }
    // Victoria en el juego
    juegoCompletado() {
        this.stopTimer();
        this.music.pause();
        this.aplausos.play();

        setTimeout(() => {
            console.log("¡Victoria confirmada!");
            const celdas = this.app.querySelectorAll('div');
            celdas.forEach(div => {
            div.tabIndex = -1; 
            div.classList.replace("bg-red-200", "bg-green-200");
            if (!div.classList.contains("bg-gray-300")) {
                div.classList.add("bg-green-100"); 
            }
        });
        localStorage.removeItem('sudoku_save');
        
        alert("¡Felicidades! Has resuelto el Sudoku perfectamente. 🏆");
            
        
        }, 700);
        
    }
    //Iniciar temporizador
    startTimer(segundosIniciales = 0) {
        this.stopTimer();
        this.secondsElapsed = segundosIniciales;
        this.updateTimerDisplay();
    
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    }
    //Parar temporizador
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    //Actualizar temporizador
    updateTimerDisplay() {
        const minutes = Math.floor(this.secondsElapsed / 60);
        const seconds = this.secondsElapsed % 60;
        
        const spans = this.timeContainer.querySelectorAll('span');
        spans[0].textContent = String(minutes).padStart(2, '0');
        spans[1].textContent = String(seconds).padStart(2, '0');
    }
    //Salir
    exitGame() {
        this.click.play();
        this.stopTimer();
        this.boardGame.classList.add('hidden');
        this.timeContainer.classList.add('hidden');
        this.buttonBottom.classList.add('hidden');
        this.header.classList.remove('hidden');
        this.header.classList.remove('opacity-0');
        this.music.pause();
    }
    //Resetear el juego
    resetGame() {
        this.click.play();
        localStorage.removeItem('sudoku_save');
    
        this.originalBoard = new Array(81).fill(0);
        this.boardData = [];
        this.secondsElapsed = 0;
    
        this.app.innerHTML = "";
    
        this.initSudoku();
        this.startTimer(0);
        console.log("¡Nueva partida generada con éxito!");
    }
    //Resolver juego
    solveGame() {
        this.click.play();
        
        this.stopTimer();
    
        const celdas = this.app.querySelectorAll('div');
        celdas.forEach(div => {
            if (div.tabIndex === 0) {
                const solucion = div.dataset.valorReal;
                
                div.textContent = solucion;
                
                div.classList.add("text-[#2B463C]"); 
                div.classList.remove("bg-[#D93718]"); 
                
                div.tabIndex = -1;
            }
        });
    
        localStorage.removeItem('sudoku_save');
        setTimeout(() => {
            alert("Sudoku resuelto automáticamente. ¡A por el siguiente! 🧩");
        }, 200);
    }





}
