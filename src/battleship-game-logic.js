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
        const filteredCondition = condition.filter(status => regex.test(status)); 
        // the number of hits(length of the filtered array) should correspond to the length of the ship if it is sunk
        if(filteredCondition.length === condition.length) {
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
    const createBoard = (gridsize) => {
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
        let regexMiss = /.*miss/;
        let regexHit = /.*hit/;
        let row = board[rowNumber.toString()];
        if(regexMiss.test(row[columnNumber]) || regexHit.test(row[columnNumber])) {
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
           return 'hit';
       }
           
       else {
           row[columnNumber] = 'miss';
           return 'miss';
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

    return { board, ships, placeShip, receiveAttack, checkAllShips };
};

const player = (name) => {

    // store an array of attacks made by computer, if most recent one is a hit, check adjacent coordinates
    const attacks = [];
    const playerName = name;
    const playerBoard = gameboardFactory(10);

    const makeAttack = (rowNumber, columnNumber, opponent) => {
        // computer will follow this path
        if(opponent.playerName !== 'computer') {
            // check if computer's most recent attack is a hit, if so 
            if(attacks.length > 0) {
                let regex = /.*hit/;
                let mostRecentAttack = attacks[attacks.length - 1];
                if(regex.test(mostRecentAttack)) {
                    let recentAttackArray = mostRecentAttack.split('');
                    let newRowNumber = parseInt(recentAttackArray[0]);
                    let newColumnNumber = parseInt(recentAttackArray[1]);
                    
                    // test the strategy of checking left, right, up, and down from the successful attack
                    const outcome = testStrategy(newRowNumber, newColumnNumber, opponent.playerBoard);
                    // if the strategy works then we can return, and end the computer's turn
                    if(outcome !== false) {
                        if(outcome.includes('row')) {
                        // obtain element from ui gameboard that matches coordinates of randomly generated coordinates
                        let coordinate = `Coordinate:${outcome[2]}${newColumnNumber}`;
                        let gameBoardElement = document.querySelector(`div[id='${opponent.playerName}'] div[id='${coordinate}']`);
                        gameBoardElement.click();
                        }
                        else if(outcome.includes('column')) {
                        // obtain element from ui gameboard that matches coordinates of randomly generated coordinates
                        let coordinate = `Coordinate:${newRowNumber}${outcome[2]}`;
                        let gameBoardElement = document.querySelector(`div[id='${opponent.playerName}'] div[id='${coordinate}']`);
                        gameBoardElement.click();
                        };
                        
                        return outcome[0];
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
                result = testAttack(randomRowNumber, randomColumnNumber);
            };
            // once a valid attack is obtained, make the attack
            const attackResult = opponent.playerBoard.receiveAttack(randomRowNumber, randomColumnNumber);
            attacks.push(`${randomRowNumber}${randomColumnNumber}, ${attackResult}`);

            // obtain element from ui gameboard that matches coordinates of randomly generated coordinates
            let coordinate = `Coordinate:${randomRowNumber}${randomColumnNumber}`;
            let gameBoardElement = document.querySelector(`div[id='${opponent.playerName}'] div[id='${coordinate}']`);
            gameBoardElement.click();

            // now return result for the computerResponse function to make use of
            return attackResult;
            
        }
        // human controlled path
        else {
            const result = opponent.playerBoard.receiveAttack(rowNumber, columnNumber);
            return result;
        };
    };

    // determine whether the computer is set to make a valid attack
    const testAttack = (rowNumber, columnNumber) => {
        // make sure rowNumber and columnNumber do not go beyond the boundaries of the board
        if(rowNumber > 9 || rowNumber < 0 || columnNumber > 9 || columnNumber < 0) {
            return false;
        };
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
            return [attackResult, 'row', rowNumberPlus];
        };
        // rowNumber - 1 check
        let rowNumberMinus = rowNumber - 1;
        result = testAttack(rowNumberMinus, columnNumber);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumberMinus, columnNumber);
            attacks.push(`${rowNumberMinus}${columnNumber}, ${attackResult}`)
            return [attackResult, 'row', rowNumberMinus];
        };
        // columnNumber + 1 check
        let columnNumberPlus = columnNumber + 1;
        result = testAttack(rowNumber, columnNumberPlus);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumber, columnNumberPlus);
            attacks.push(`${rowNumber}${columnNumberPlus}, ${attackResult}`)
            return [attackResult, 'column', columnNumberPlus];
        }
        // columnNumber - 1 check
        let columnNumberMinus = columnNumber - 1;
        result = testAttack(rowNumber, columnNumberMinus);
        if(result === true) {
            const attackResult = opponentBoard.receiveAttack(rowNumber, columnNumberMinus);
            attacks.push(`${rowNumber}${columnNumberMinus}, ${attackResult}`)
            return [attackResult, 'column', columnNumberMinus];
        }
        else {
            return false;
        }
    };

    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
      }
    return {playerName, playerBoard, makeAttack}
};

const gameLoop = (name) => {
    // create players
    const humanPlayer = player(name);
    const computerPlayer = player('computer');

    // create the gameboard visuals
    DOM.createGameboardVisual(humanPlayer);
    DOM.createGameboardVisual(computerPlayer);

    // TODO: manually place ships for now, add way for user to specify later(would need function to check if space is occupied)
    humanPlayer.playerBoard.placeShip(0, 0, 6, 'chesapeake', 'horizontal');
    humanPlayer.playerBoard.placeShip(5, 7, 3, 'altuna', 'horizontal');
    humanPlayer.playerBoard.placeShip(2, 3, 5, 'peep', 'horizontal');
    humanPlayer.playerBoard.placeShip(8, 3, 5, 'fate', 'horizontal');
    humanPlayer.playerBoard.placeShip(9, 3, 5, 'toot', 'horizontal');
    humanPlayer.playerBoard.placeShip(1, 3, 5, 'feet', 'horizontal');

    computerPlayer.playerBoard.placeShip(0, 5, 3, 'york', 'vertical');
    computerPlayer.playerBoard.placeShip(7, 3, 2, 'pentatonic', 'horizontal');

    // make the computer's board responsive
    DOM.makeGameBoardsAttackable(computerPlayer, humanPlayer);

    const determineWinner = () => {
        const humanLost = humanPlayer.playerBoard.checkAllShips();
        const computerLost= computerPlayer.playerBoard.checkAllShips();
        if(humanLost === true) {
            document.getElementById('winner').textContent = 'Computer Wins';
            const coordinateDivsArray = Array.from(document.querySelectorAll('#gameboards div'));
            coordinateDivsArray.forEach(div => div.classList.add('waitForComputer'));
            return;
        }
        else if (computerLost === true) {
            document.getElementById('winner').textContent = `${humanPlayer.playerName} wins`;
            const coordinateDivsArray = Array.from(document.querySelectorAll('#gameboards div'));
            coordinateDivsArray.forEach(div => div.classList.add('waitForComputer'));
            return;
        }
        else {
            return 'No Winner Yet';
        }
    };
    return {determineWinner}
};

const DOM = (() => {
    //document.getElementById('startGame').addEventListener('click', gameLoop);
    

    // event listener additions that will be called later as needed(eg. placing ships)
    /*  function creates the gameboards, each div in the grid will have the respective coordinate data */
    const createGameboardVisual = (player) => {
        // will eventually append each coordinate in grid to gamebaord div
        let gameboard = document.createElement('div');
        gameboard.id = player.playerName;
        gameboard.classList.add('gameboard');

        // create document fragment to add coordinate divs to
        const documentFragment = document.createDocumentFragment();

        // variable to contain the actual board object
        let gameboardObject = player.playerBoard.board;
        // create a div representation of each coordinate in the gameboard object
        for(let key in gameboardObject) {
            let rowCoordinate = key;
            for(let i = 0; i < gameboardObject[key].length; i++) {
                let columnCoordinate = i;
                // now create the coordinate div
                coordinateData = document.createElement('div');
                coordinateData.id = 'Coordinate:' + rowCoordinate + columnCoordinate;
                coordinateData.classList.add('coordinateDiv');
                // append the coordinate div to the doc frag
                documentFragment.appendChild(coordinateData);
            };
        };
        // append the finished doc fragment to the gameboard div, append gameboard to the gameboards div
        gameboard.appendChild(documentFragment);
        document.getElementById('gameboards').appendChild(gameboard);
    };

    // add event listeners to the computer's coordinate divs(each location in the grid)
    const makeGameBoardsAttackable = (computerPlayer, humanPlayer) => {
        const computerCoordinateDivsArray = Array.from(document.querySelectorAll('#computer div'));
        computerCoordinateDivsArray.forEach(div => div.addEventListener('click', (e) => {
            attackComputer(e, computerPlayer, humanPlayer);
        }));
        const humanCoordinateDivsArray = Array.from(document.querySelectorAll(`div[id='${humanPlayer.playerName}'] div`));
        humanCoordinateDivsArray.forEach(div => div.addEventListener('click', (e) => {
            attackHuman(e, humanPlayer);
        }));
    };

    // called upon clicking on a grid coordinate within the computer's gameboard
    const attackComputer = (event, computerPlayer, humanPlayer) => {
        // id looks like(ex. 'Coordinate:01')
        // get the coordinates from the coordinate div html
        const coordinateClicked = event.target;
        const id = coordinateClicked.id;
        const idArray = id.split(':');
        const coordinates = idArray[1];
        const coordinatesArray = coordinates.split('');
        let rowNumber = parseInt(coordinatesArray[0]);
        let columnNumber = parseInt(coordinatesArray[1]);

        // make the attack and display the result on the board
        const result = humanPlayer.makeAttack(rowNumber, columnNumber, computerPlayer)
        if(result === 'hit') {
            coordinateClicked.textContent = 'X';
            coordinateClicked.classList.add('hit');
            let status = game.determineWinner();
            if(status === 'Human Wins') {
                document.getElementById('winner').textContent = `${humanPlayer} wins`;
                const coordinateDivsArray = Array.from(document.querySelectorAll('#gameboards div'));
                coordinateDivsArray.forEach(div => div.classList.add('waitForComputer'));
                return;
            }
            else {
                let result = computerResponse(0, 0, humanPlayer, computerPlayer) 
                // check if computer won
                if(result === 'hit') {
                    let outcome = game.determineWinner();
                    if(outcome === 'No Winner Yet') {
                        const coordinateDivsArray = Array.from(document.querySelectorAll('#computer div'));
                        coordinateDivsArray.forEach(div => div.classList.toggle('waitForComputer'));
                    };
                }
                else {
                      const coordinateDivsArray = Array.from(document.querySelectorAll('#computer div'));
                        coordinateDivsArray.forEach(div => div.classList.toggle('waitForComputer'));
                }
            };
            
        }
        else if (result === 'miss') {
            coordinateClicked.textContent = 'O';
            coordinateClicked.classList.add('miss');
            let result = computerResponse(0, 0, humanPlayer, computerPlayer) 
            // check if computer won
            if(result === 'hit') {
               let outcome = game.determineWinner();
               if(outcome === 'No Winner Yet') {
                 const coordinateDivsArray = Array.from(document.querySelectorAll('#computer div'));
                 coordinateDivsArray.forEach(div => div.classList.toggle('waitForComputer'));
               }
            }
            else {
                const coordinateDivsArray = Array.from(document.querySelectorAll('#computer div'));
                coordinateDivsArray.forEach(div => div.classList.toggle('waitForComputer'));
            }
        }
        else {
            return;
        };
    };

    // when computer makes a valid attack the corresponding element is clicked on in the human's gameboard
    const attackHuman = (event, humanPlayer) => {
        // regex for determining hit or miss
        regexHit = /.*hit/;
        regexMiss = /.*miss/;
        let coordinateClicked = event.target;
        // was it a hit or a miss
        const id = coordinateClicked.id;
        const idArray = id.split(':');
        const coordinates = idArray[1];
        const coordinatesArray = coordinates.split('');
        let rowNumber = parseInt(coordinatesArray[0]);
        let columnNumber = parseInt(coordinatesArray[1]);

        let humanGameBoard = humanPlayer.playerBoard.board;
        let row = humanGameBoard[rowNumber];
        let status = row[columnNumber];

        if(regexHit.test(status)) {
            coordinateClicked.classList.add('hit');
            coordinateClicked.textContent = 'X';
        }
        else if(regexMiss.test(status)) {
            coordinateClicked.classList.add('miss');
            coordinateClicked.textContent = 'O';
        };
    };

    // after human player makes an attack the computer responds with its own attack
    const computerResponse = (rowNumber, columnNumber, humanPlayer, computerPlayer) => {
        const coordinateDivsArray = Array.from(document.querySelectorAll("div[id='computer'] div"));
        coordinateDivsArray.forEach(div => div.classList.toggle('waitForComputer'));
        let result = computerPlayer.makeAttack(rowNumber, columnNumber, humanPlayer);
        return result;
    };


    return {createGameboardVisual, makeGameBoardsAttackable}
})();

let game = gameLoop('john');


//export { shipFactory, gameboardFactory, player, DOM, gameLoop };