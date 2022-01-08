/*hit can take multiple arguments, use rest operator, condition property is array that contains whether
a section is hit, is sunk looks at condition property and checks if each index contains a hit marker,
if they do then the ship is sunk */

const shipFactory = (length, nameOfShip) => {

    // an array that keeps track of which sections of the ship have been hit
    const condition = [];

    // a name that will be used as a key in an object containing multiple ships
    const shipName = nameOfShip;

    /* Passes in the section of the ship that is hit
    and marks the corresponding index as hit in the condition array */
    const hit = (status, sectionsOfShip) => {
        condition[sectionsOfShip] = status; // status is something like(coordinates, 'hit')
    };

    // filter the condition array to see if all indexes contain 'hit', if so the ship is sunk
    const isSunk = () => {
        let regex = /.*hit/; // regex expression for matching when determining whether a ship has sunk
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
        for(let i = 0; i < 10; i++) {
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
            board[i] = createRow();
        };
        return board;    
    };
    
    const board = createBoard(10);

    // create a ship and place it on the gameboard, can choose horizontal or vertical, also specify length of ship
    const placeShip = (rowNumber, columnNumber, lengthOfShip, nameOfShip, orientation) => {
        // need to make sure row number is a string
        let stringifiedRowNumber = rowNumber.toString();
        // create the ship
        const ship = shipFactory(lengthOfShip, nameOfShip);
        ships[ship.shipName] = ship;
        // based on orientation of ship, adding ships to the board will involve one of two algorithms
        if(orientation === 'horizontal') {
            let row = board[`${stringifiedRowNumber}`] // make sure rownumber is a string for property access
            for(let i = 0; i < lengthOfShip; i++) {
                row[columnNumber] = `${ship.shipName}, not damaged`;
                ship.condition.push(`${rowNumber}${columnNumber}, not damaged`)
                columnNumber += 1; // after each loop move to the next column
            };
        }
        else if(orientation === 'vertical'){
            let row;
            for(let i = 0; i < lengthOfShip; i++) {
                row = board[`${stringifiedRowNumber}`] // get the array present at the row number
                row[columnNumber] = `${ship.shipName}, not damaged`; // update the correct index of the array
                ship.condition.push(`${rowNumber}${columnNumber}, not damaged`);
                rowNumber += 1; // after each loop move to the next row
                stringifiedRowNumber = rowNumber.toString();
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
        
        const attackCoordinates = `${rowNumber}${columnNumber}`;
    
       // see if a ship name is present at the coordinate
       let regexShip = /.*not\sdamaged/;
       if(regexShip.test(row[columnNumber])) {
           const coordinateData = row[columnNumber];
           let coordinateDataArray = coordinateData.split(',');
           const shipName = coordinateDataArray[0];
           coordinateDataArray[1] = ' hit';
           const newCoordinateData = coordinateDataArray.join(',');
           row[columnNumber] = newCoordinateData;
           
           // update ship's condition
           let ship = ships[shipName];
           let index = ship.condition.indexOf(`${attackCoordinates}, not damaged`);
           let status = `${attackCoordinates}, hit`
           ship.hit(status, index);
       }
           
       else {
           row[columnNumber] = 'miss';
           return;
       };
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

const player = (name) => {

    // store an array of attacks made, if most recent one is a hit, check adjacent coordinates
    const attacks = [];
    const playerName = name;
    const playerBoard = gameboardFactory(10);

    const makeAttack = (rowNumber, columnNumber, opponentBoard) => {
        // computer will follow this path
        if(name === 'computer') {
            // check if computer's most recent attack is a hit, if so 
            if(attacks.length > 0) {
                let regex = /.*hit/;
                let mostRecentAttack = attacks[attacks.length - 1];
                if(regex.test(mostRecentAttack)) {
                    let recentAttackArray = mostRecentAttack.split('');
                    let newRowNumber = parseInt(recentAttackArray[0]);
                    let newColumnNumber = parseInt(recentAttackArray[1]);
                    
                    // test the strategy of checking left, right, up, and down from the successful attack
                    const outcome = testStrategy(newRowNumber, newColumnNumber, opponentBoard);
                    // if the strategy works then we can return, and end the computer's turn
                    if(outcome === true) {
                        return;
                    };
                };
            };

            // if most recent attack is not a hit find a valid random attack for the computer
            let result = false; // make sure it gets tested at least once, set result to false
            let randomRowNumber;
            let randomColumnNumber;
            while(result === false) {
                randomRowNumber = getRandomInt(0,9);
                randomColumnNumber = getRandomInt(0,9);
                // test whether the random numbers are valid
                result = testAttack(randomRowNumber, randomColumnNumber)
            };
            // once a valid attack is obtained, make the attack
            const attackResult = opponentBoard.receiveAttack(randomRowNumber, randomColumnNumber);
            attacks.push(`${randomRowNumber}${randomColumnNumber}, ${attackResult}`)
        }
        // human controlled path
        else {
            opponentBoard.receiveAttack(rowNumber, columnNumber)
        };
    };

    // determine whether the computer is set to make a valid attack
    const testAttack = (rowNumber, columnNumber) => {
        const gameBoard = playerBoard.board;
        const row = gameBoard[rowNumber.toString()];
        const status = row[columnNumber];
        let regexHit = /.*miss/;
        let regexMiss = /.*hit/;

        // check whether it has already made an attack on this coordinate or its an invalid coordinate
        if(regexHit.test(status)|| regexMiss.test(status) || status === undefined || status === null) {
            return false;
        }
        else {
            return true;
        }
    };

    // modify coordinates and check for validity that coordinate has not been previously attacked
    const testStrategy = (rowNumber, columnNumber, opponentBoard) => {
        let result;
        // rowNumber +1 check
        let rowNumberPlus = rowNumber + 1;
        result = testAttack(rowNumberPlus, columnNumber);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumberPlus, columnNumber);
            attacks.push(`${rowNumberPlus}${columnNumber}, ${attackResult}`)
            return true;
        };
        // rowNumber - 1 check
        let rowNumberMinus = rowNumber - 1;
        result = testAttack(rowNumberMinus, columnNumber);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumberMinus, columnNumber);
            attacks.push(`${rowNumberMinus}${columnNumber}, ${attackResult}`)
            return true;
        };
        // columnNumber + 1 check
        let columnNumberPlus = columnNumber + 1;
        result = testAttack(rowNumber, columnNumberPlus);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumber, columnNumberPlus);
            attacks.push(`${rowNumber}${columnNumberPlus}, ${attackResult}`)
            return true;
        }
        // columnNumber - 1 check
        let columnNumberMinus = columnNumber - 1;
        result = testAttack(rowNumber, columnNumberMinus);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumber, columnNumberMinus);
            attacks.push(`${rowNumber}${columnNumberMinus}, ${attackResult}`)
            return true;
        }
        return false;
    };

    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
      }
    return {playerName, playerBoard, makeAttack}
};

const DOM = () => {
    // need initial event listeners added

    // event listener additions that will be called later as needed(eg. placing ships)
};

//TODO: create a function to randomly place the computer's ships

const gameLoop = (name) => {
    const humanPlayer = player(name);
    const computerPlayer = player('computer');

    // gameloop continues as long as either player has not had all of their ships sunken
    while(humanPlayer.playerBoard.checkAllShips() === false && computerPlayer.playerBoard.checkAllShips() === false) {
    
    };
    const determineWinner = () => {
        const humanLost = humanPlayer.playerBoard.checkAllShips();
        const computerLost= computerPlayer.playerBoard.checkAllShips();
        if(humanLost === true) {
            return 'Computer Wins';
        }
        else if (computerLost === true) {
            return 'Human Wins';
        }
        else {
            return 'No Winner Yet';
        }
    };
    return { determineWinner }
};





export { shipFactory, gameboardFactory, player, gameLoop };