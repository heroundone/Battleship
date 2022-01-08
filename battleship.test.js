import { shipFactory } from "./src/battleship-game-logic.js";
import { gameboardFactory } from "./src/battleship-game-logic.js";
import { player } from "./src/battleship-game-logic.js";

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

test('check if ship gets placed', () => {
    const result = mockBoard.placeShip(0, 0, 5, 'chesapeake', 'horizontal');
    expect(result[1]).toEqual({'0':['chesapeake, not damaged','chesapeake, not damaged', 'chesapeake, not damaged', 'chesapeake, not damaged', 'chesapeake, not damaged', 'nothing here', 'nothing here', 'nothing here', 'nothing here', 'nothing here']})
}); 

test("create players, sink all of one player's ships", () => {
    const human = player('human');
    const dog = player('dog');
    human.playerBoard.placeShip(0, 0, 2, 'bay', 'horizontal');
    human.playerBoard.placeShip(5, 6, 2, 'crimson', 'vertical');
    dog.makeAttack(0, 0, human.playerBoard);
    dog.makeAttack(0, 1, human.playerBoard);  
    dog.makeAttack(5, 6, human.playerBoard);  
    dog.makeAttack(6, 6, human.playerBoard); 
    expect(human.playerBoard.checkAllShips()).toBeTruthy() 
}); 

test("computer player can eventually sink all of player's ships", () => {
    const computer = player('computer');
    const human = player('human');
    human.playerBoard.placeShip(0, 0, 2, 'bay', 'horizontal');
    human.playerBoard.placeShip(5, 6, 2, 'crimson', 'vertical');
    while(human.playerBoard.checkAllShips() === false) {
        computer.makeAttack(0, 0, human.playerBoard);
    };
    expect(human.playerBoard.checkAllShips()).toBeTruthy() 
});