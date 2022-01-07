/*hit can take multiple arguments, use rest operator, condition property is array that contains whether
a section is hit, is sunk looks at condition property and checks if each index contains a hit marker,
if they do then the ship is sunk */

const shipFactory = (length, nameOfShip) => {

    // an array that keeps track of which sections of the ship have been hit
    const condition = [];

    // a name that will be used as a key in an object containing multiple ships
    const shipName = nameOfShip;

    /* Passes in the section or sections of the ship that is/are hit
    and marks the corresponding index(es) as hit in the condition array */
    const hit = (status, sectionsOfShipTargeted) => {
        condition[sectionsOfShipTargeted] = status; // status is something like(coordinates, 'hit')
        return condition;
    };

    // filter the condition array to see if all indexes contain 'hit', if so the ship is sunk
    let regex = /.*hit/; // regex expression for matching when determining whether a ship has sunk
    const isSunk = () => {
        const filteredCondition = condition.filter(status => regex.test(status)); // FIX: USE REGULAR EXPRESSION
        // the number of hits(length of the filtered array) should correspond to the length of the ship if it is sunk
        if(filteredCondition.length === length) {
            return true;
        } else {
            return false;
        };
    };

    return {length, condition, shipName, hit, isSunk};
};

// 'nothing here(not attacked yet)' 'missed' 'hit' 'not damaged(ship is here)'
const gameboardFactory = (gridSize) => {
    // gameboard needs a way to store the ships 
    const ships = {};

    // create an array that represents a row in the gameboard
    const createRow = () => {
        const row = [];
        for(let i = 0; i < 8; i++) {
            row.push('nothing here');
        };
        return row;
    };

    /* create a gameboard that is represented as an object(keys are row numbers, 
       and values are the status of each square in the row)*/
    const createBoard = () => {
        // parameters for what grid size can be
        if(gridSize <= 0 || gridSize > 10) {
            return;
        };
        const board = {};
        for(let i = 0; i < gridSize; i++) {
            board[i] = createRow(gridSize);
        };
        return board;    
    };
    
    const board = createBoard(10);

    // create a ship and place it on the gameboard, can choose horizontal or vertical, also specify length of ship
    const placeShip = (rowNumber, columnNumber, lengthOfShip, nameOfShip, orientation) => {
        // need to make sure row number is a string
        let stringifiedRowNumber = rowNumber.toString();
        // make sure columnNumber is an int
        let stringifiedColumnNumber = columnNumber.toString();
        // create the ship
        const ship = shipFactory(lengthOfShip, nameOfShip);
        // based on orientation of ship modifying board values will be different
        if(orientation === 'horizontal') {
            let row = board[`${stringifiedRowNumber}`] // make sure rownumber is a string for property access
            for(let i = 0; i < lengthOfShip; i++) {
                row[columnNumber] = 'not damaged';
                ship.condition.push(`${rowNumber}${columnNumber}, not damaged`)
                columnNumber += 1; // after each loop move to the next column
            };
            ships[ship.shipName] = ship;
        }
        else if(orientation === 'vertical'){
            let row;
            for(let i = 0; i < lengthOfShip; i++) {
                row = board[`${stringifiedRowNumber}`] // get the array present at the row number
                row[columnNumber] = 'not damaged'; // update the correct index of the array
                rowNumber += 1; // after each loop move to the next row
                newRowNumber = rowNumber.toString();
            };
        };
        return [ship, board];
    };

    const receiveAttack = (rowNumber, columnNumber) => {
        // handle an attack that has already been made once
        let row = board[rowNumber.toString()];
        if(row[columnNumber] === 'miss' || row[columnNumber] === 'hit') {
            return
        };
        /* iterate through keys, check if array contains coordinate, if so that's our ship, get index of coordinate,
         use index of coordinate to modify condition array for the ship, update board 'not damaged' to 'hit'*/
        /*  if no ship contains those coordinates, then modify the board, replace 'nothing here' with 'miss'*/
        const attackCoordinates = `${rowNumber}${columnNumber}`;
        for(let key in ships) {
           let ship = ships[key];
           if(ship.condition.includes(`${attackCoordinates}, not damaged`)) {
               // update ship's condition
               let index = ship.condition.indexOf(`${attackCoordinates}, not damaged`);
               let status = `${attackCoordinates}, hit`
               ship.hit(status, index);

               // update the board
               row[columnNumber] = 'hit';
               return 'hit'
           } else {
               row[columnNumber] = 'miss';
               return 'miss'
           }
        }
    };

    const checkAllShips = () => {
        for(let key in ships) {
            if(ships[key].isSunk()) {
                continue;
            } else {
                return false;
            }
        };
        return true;
    };

    return { board, placeShip, receiveAttack, checkAllShips };
};

// ships.ship[hitzones] = arrray

export { shipFactory, gameboardFactory };