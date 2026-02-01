import './style.css';
import { Sudoku } from './Sudoku';


const miSudoku = new Sudoku();
miSudoku.initSudoku();

window.startGame = () => miSudoku.startGame();
window.exitGame = () => miSudoku.exitGame();
window.resetGame = () => miSudoku.resetGame();
window.solveGame = () => miSudoku.solveGame();

