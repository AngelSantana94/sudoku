import './style.css';

let app = document.querySelector("#app")
let puzzleLimpio = new Array(81).fill(0);
let filaNormal = [1,2,3,4,5,6,7,8,9]
let tableroParaResolver = [...puzzleLimpio];
let keyDownNumbers = ["1","2","3","4","5","6","7","8","9"];
let keyDownArrows =["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace"]


app.addEventListener("keydown", (e) =>{
    if(!keyDownNumbers.includes(e.key) && !keyDownArrows.includes(e.key)) {return};

    if(e.target.tabIndex === -1) {
        if(keyDownNumbers.includes(e.key)){
            return
        } 
        e.target.textContent = e.target.dataset.valorReal
    }
    
    if(keyDownNumbers.includes(e.key)){

        e.target.textContent = e.key;
        e.target.dataset.valorIntroducido = e.key;


    }else if(keyDownArrows.includes(e.key)){
        let idNumber = parseInt(e.target.id);
        let nextCell;
    switch (e.key) {
        case ("ArrowUp"):
            if (idNumber >= 9 ) { 
                nextCell = document.getElementById(idNumber - 9);
                nextCell.focus();
            }
            break;
        case ("ArrowDown"):
            if (idNumber <= 72){
                nextCell = document.getElementById(idNumber + 9);
                nextCell.focus();
            }
            break;
        case ("ArrowRight"):
            if(idNumber % 9 !== 8){
                nextCell = document.getElementById(idNumber + 1);
                nextCell.focus();
            }
            break;
        case ("ArrowLeft"):
            if(idNumber % 9 !== 0){
                nextCell = document.getElementById(idNumber - 1);
            nextCell.focus();
            }            
            break;
        case ("Backspace"):
            if(e.target.tabIndex === 0){
                e.target.textContent = "";
            }else{
                return
            }
            
        default:
            break;
    }; 
}
    
    

    
})
app.addEventListener('focusin', (e) => {
    e.preventDefault()
    if(e.target.dataset.isGray === "true"){
        e.target.className = `border border-black flex items-center justify-center aspect-square bg-gray-300 border-4 border-indigo-500/100 `;
    }else{
        e.target.className = "border border-black flex items-center justify-center aspect-square bg-white border-4 border-indigo-500/100"
    }

    

})
app.addEventListener("focusout", (e) => {
    if(e.target.dataset.isGray === "true"){
        e.target.className = `border border-black flex items-center justify-center aspect-square bg-gray-300`
    }else{
        e.target.className = "border border-black flex items-center justify-center aspect-square bg-white "
    }
})

app.addEventListener("click", (e) =>{
    
})


const celdas = puzzleLimpio.map((valor, i) =>{
    return {valor, i};
})





//Función fisher-yates
function mezclar(lista) {
    let listaMezclada = [];
    let listaOriginal = lista.slice();

    while (listaOriginal.length > 0) {
        let posicion = Math.floor(Math.random() * listaOriginal.length);
        let elemento = listaOriginal.splice(posicion, 1)[0];
        listaMezclada.unshift(elemento);
    }

    return listaMezclada;
}


//Función resolver sudoku
function resolverSudoku(tablero, indice = 0) {
    // CASO BASE: Si llegamos al índice 81, ¡hemos llenado todo el tablero!
    if (indice === 81) return true;

    // Si la celda ya tiene un número (porque lo pusimos con Fisher-Yates al inicio)
    // saltamos a la siguiente celda directamente.
    if (tablero[indice] !== 0) {
        return resolverSudoku(tablero, indice + 1);
    }

    // PROBAMOS NÚMEROS DEL 1 AL 9
    for (let num = 1; num <= 9; num++) {
        
        if (esSeguro(tablero, indice, num)) {
            tablero[indice] = num; // "Lo pongo de prueba"

            // Llamamos a la función para que intente llenar la siguiente celda (indice + 1)
            if (resolverSudoku(tablero, indice + 1)) {
                return true; // Si el de adelante dice que todo va bien, seguimos
            }

            // Si el de adelante me dice "oye, aquí ya no cabe nada"...
            tablero[indice] = 0; // "BORRAMOS" (Backtrack) y probamos con el siguiente num
        }
    }

    return false; // Si probó del 1 al 9 y nada sirvió, avisa al de atrás
}

//Función de check
function esSeguro(tablero, indice, numero) {
    const filaActual = Math.floor(indice / 9);
    const colActual = indice % 9;

    //Chequeamos filas y columnas
    for (let i = 0; i < 9; i++) {
        if (tablero[filaActual * 9 + i] === numero)return false;
        if (tablero[i * 9 + colActual] === numero)return false;
    }


    //Chequeamos cuadrados 3x3
    const inicioFila = Math.floor(filaActual / 3) * 3;
    const inicioCol = Math.floor(colActual / 3) * 3;

    for (let f = 0; f < 3; f++) {
        for (let c = 0; c < 3; c++) {
            if (tablero[(inicioFila + f) * 9 + (inicioCol + c)] === numero) {
                return false;
            }
        }
    }

    return true;
}


let filaMezclada = mezclar(filaNormal);
for(let h = 0; h< 9; h++){
    tableroParaResolver[h] = filaMezclada[h]
}

if(resolverSudoku(tableroParaResolver)){
    console.log("¡Sudoku aleatorio generado!");
}

let nuevoTablero = [...tableroParaResolver]
const tableroDom = nuevoTablero.map(( valor, i) =>{
    let celdasVisibles= Math.random() < 0.43;
    return {
        id: i,
        valorReal: valor,
        valorMostrado: celdasVisibles ? valor : "",
        esFijo: celdasVisibles,
    }
});
console.log(tableroDom)


//Renderizamos el tablero
for(let i of tableroDom){
    const row = Math.floor(i.id / 9);
    const col = i.id % 9;
    
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);
    
    const isGray = (blockRow + blockCol) % 2 === 0;
    
    const newBox = document.createElement("div");
    newBox.id = i.id;
    newBox.className = `border border-black flex items-center justify-center aspect-square ${isGray ? 'bg-gray-300' : 'bg-white'}`;
    newBox.textContent = i.valorMostrado;
    newBox.tabIndex =  i.esFijo ? -1 : 0;
    newBox.dataset.valorReal = i.valorReal;
    newBox.dataset.isGray = isGray ? true : false
    
    app.appendChild(newBox)
    
}

//function obtenerEstadoDelTablero() {
//    const celdas = document.querySelectorAll('#app div');
//    return Array.from(celdas).map(div => {
//        return div.textContent === "" ? 0 : parseInt(div.textContent);
//    });
//}

