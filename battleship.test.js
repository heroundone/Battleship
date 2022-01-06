import { shipFactory } from "./src/battleship-game-logic.js";

const mockShip = shipFactory(3);

test('create a ship', () => {
    expect(shipFactory(3)).not.toBeUndefined();
});

test('ship can be hit', () => {
    expect(mockShip.hit(1)).toEqual(['not hit', 'hit', 'not hit'])
});

test('ship can be sunk', () => {
    mockShip.hit(0, 1, 2);
    expect(mockShip.isSunk()).toBeTruthy();
});