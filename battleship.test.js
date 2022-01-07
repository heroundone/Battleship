import { shipFactory } from "./src/battleship-game-logic.js";
import { gameboardFactory } from "./src/battleship-game-logic.js";

const mockShip = shipFactory(3);
const mockBoard = gameboardFactory(1);

// tests for ship factory function
test('create a ship', () => {
    expect(shipFactory(1)).not.toBeUndefined();
});

test('ship can be hit', () => {
    expect(mockShip.hit(1)).toEqual(['not hit', 'hit', 'not hit'])
});

test('ship can be sunk', () => {
    mockShip.hit(0, 1, 2);
    expect(mockShip.isSunk()).toBeTruthy();
});

// tests for gameboard factory function
test('create a gameboard', () => {
    expect(gameboardFactory()).not.toBeUndefined();
});

// after placeShip, check new values of board, placeShip should return the board
test('check if ship gets placed', () => {
    expect(mockBoard.placeShip(0, 0, 5, 'horizontal')).toEqual({'0':['not hit','not hit', 'not hit', 'not hit', 'not hit', 'nothing here', 'nothing here', 'nothing here']})
});