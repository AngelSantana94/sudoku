import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Sudoku } from './Sudoku'; // Ajusta la ruta si es necesario

describe('Sudoku Logic & UI Validation', () => {
  let game;

  beforeEach(() => {
    // 1. Limpiamos el DOM
    document.body.innerHTML = `
      <div id="header"></div>
      <div id="boardGame" class="hidden"></div>
      <div id="time" class="hidden"><span>00</span><span>00</span></div>
      <div id="button-bottom" class="hidden"></div>
      <div id="sudoku-grid"></div>
    `;

    // 2. EL ARREGLO PARA LA MÚSICA (Usando función tradicional)
    global.Audio = function() {
      this.play = vi.fn().mockResolvedValue(undefined);
      this.pause = vi.fn();
      this.currentTime = 0;
      this.loop = false;
      this.volume = 1;
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
    };

    // 3. Mock de Vite
    vi.stubGlobal('import.meta', { env: { BASE_URL: '/' } });

    // 4. Instancia de la clase
    game = new Sudoku();
  });

  it('should highlight cells in red when there is a conflict in the same row', () => {
    // Generamos un tablero inicial
    game.initSudoku();
    
    // Forzamos dos celdas en la misma fila con el mismo número
    // (índice 0 e índice 1 están en la misma fila)
    const cell1 = document.getElementById('0');
    const cell2 = document.getElementById('1');
    
    cell1.textContent = "5";
    cell2.textContent = "5";

    // Ejecutamos la validación que tienes en tu clase
    game.checkResult(0, 5);

    // Verificamos si la clase de error de Tailwind se aplicó
    expect(cell1.classList.contains('bg-[#D93718]')).toBe(true);
    expect(cell2.classList.contains('bg-[#D93718]')).toBe(true);
  });

  it('should correctly identify when the board is completely and correctly filled', () => {
    game.initSudoku();
    const celdas = document.querySelectorAll('#sudoku-grid div');
    
    // Simulamos que el usuario llenó todo perfecto usando el valorReal de cada celda
    celdas.forEach(div => {
      div.textContent = div.dataset.valorReal;
    });

    // Espiamos la función de victoria
    const spyVictory = vi.spyOn(game, 'juegoCompletado');
    
    game.endGame();

    expect(spyVictory).toHaveBeenCalled();
  });
});