import { shipFactory } from "./src/battleship-game-logic.js";
import { gameboardFactory } from "./src/battleship-game-logic.js";

const mockShip = shipFactory(2);
const mockBoard = gameboardFactory(1);

// tests for ship factory function
test('create a ship', () => {
    expect(shipFactory(1, 'odyssey')).not.toBeUndefined();
});

test('ship can be sunk', () => {
    const result = mockBoard.placeShip(0, 0, 2, 'chesapeake', 'horizontal');
    mockBoard.receiveAttack(0,0);
    mockBoard.receiveAttack(0,1);
    expect(mockBoard.checkAllShips()).toBeTruthy();
});

// tests for gameboard factory function
test('create a gameboard', () => {
    expect(gameboardFactory()).not.toBeUndefined();
});

// after placeShip, check new values of board, placeShip should return the board
test('check if ship gets placed', () => {
    const result = mockBoard.placeShip(0, 0, 5, 'chesapeake', 'horizontal');
    expect(result[1]).toEqual({'0':['not damaged','not damaged', 'not damaged', 'not damaged', 'not damaged', 'nothing here', 'nothing here', 'nothing here']})
});