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
            return [true, condition];
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

    const testPlaceShip = (row, column, length, orientation, ships) => {
        if(ships.length === 0) {
            return 'successful'
        };
        
        if(orientation === 'horizontal') {
            for(let i = 0; i < length - 1; i++) {
                for(let ship in ships) {
                    const currentShip = ships[ship];
                    const shipCondition = currentShip.condition;
                    for(let i = 0; i < shipCondition.length; i++) {
                        let condition = shipCondition[i];
                        let status = condition.split(',');
                        let coordinate = status[0];
                        let prospectiveShipCoordinate = row.toString() + column.toString();
                        if(prospectiveShipCoordinate === coordinate) {
                            return 'unsuccessful'
                        }
                    }
                }
                column += 1;
            }
            return 'successful';
        }
        else if(orientation === 'vertical') {
            for(let i = 0; i< length - 1; i++) {
                for(let ship in ships) {
                    const currentShip = ships[ship];
                    const shipCondition = currentShip.condition;
                    for(let i = 0; i < shipCondition.length; i++) {
                        let condition = shipCondition[i];
                        let status = condition.split(',');
                        let coordinate = status[0];
                        let prospectiveShipCoordinate = row.toString() + column.toString();
                        if(prospectiveShipCoordinate === coordinate) {
                            return 'unsuccessful'
                        }
                    }
                }
                row += 1;
            }
            return 'successful';
        }
    }
    
    const placeComputerShip = (length, ships, computerBoard) => {
        let randomRow;
        let randomColumn;
        let orientation;
        let result = 'unsuccessful';
        // randomly decide ship's orientation
        let orientationDecider = DOM.getRandomInt(1, 2);
        if(orientationDecider === 1) {
            orientation = 'horizontal';
        } else {
            orientation = 'vertical';
        };
        // get a valid attack for computer
        while(result === 'unsuccessful') {
            randomRow = DOM.getRandomInt(0, 9);
            randomColumn = DOM.getRandomInt(0, 9);
            result = testPlaceShip(randomRow, randomColumn, length, orientation, ships);
        };
     
        // compose a random name for the computer's ship
        let name = '';
        for(i = 0; i < 15; i++) {
            let random = DOM.getRandomInt(97, 122);
            let char = String.fromCharCode(random);
            name += char;
        }
        computerBoard.placeShip(randomRow, randomColumn, length, name, orientation)
    }

    const receiveAttack = (rowNumber, columnNumber, opponent) => {
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
           let result = ship.isSunk();
           // result[0] should be true or false
           if(result[0] === true) {
               // result[1] should be the ship's condtion array
               let shipSectionStatus = result[1];
               // add the sunk class to each coordinate on the gamebaord
               shipSectionStatus.forEach(section => {
                   const coordinatesArray = section.split(',');
                   const coordinates = coordinatesArray[0];
                   let coordinateQuery = `Coordinate:${coordinates}`
                   let name = opponent.playerName;
                   let div = document.querySelector(`div[id='${opponent.playerName}'] div[id='${coordinateQuery}']`)
                   div.classList.add('sunk');
               });
           }
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

    return { board, ships, placeShip, receiveAttack, checkAllShips, testPlaceShip, placeComputerShip };
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
                    const outcome = testStrategy(newRowNumber, newColumnNumber, opponent);
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
                randomRowNumber = DOM.getRandomInt(0,9);
                randomColumnNumber = DOM.getRandomInt(0,9);
                // test whether the random numbers are valid
                result = testAttack(randomRowNumber, randomColumnNumber, opponent.playerBoard);
            };
            // once a valid attack is obtained, make the attack
            const attackResult = opponent.playerBoard.receiveAttack(randomRowNumber, randomColumnNumber, opponent);
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
            const result = opponent.playerBoard.receiveAttack(rowNumber, columnNumber, opponent);
            return result;
        };
    };

    // determine whether the computer is set to make a valid attack
    const testAttack = (rowNumber, columnNumber, opponentBoard) => {
        // make sure rowNumber and columnNumber do not go beyond the boundaries of the board
        if(rowNumber > 9 || rowNumber < 0 || columnNumber > 9 || columnNumber < 0) {
            return false;
        };
        const gameBoard = opponentBoard.board;
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
    const testStrategy = (rowNumber, columnNumber, opponent) => {
        let result;
        // rowNumber +1 check
        let rowNumberPlus = rowNumber + 1;
        result = testAttack(rowNumberPlus, columnNumber, opponent.playerBoard);
        if(result === true) {
            const attackResult = opponent.playerBoard.receiveAttack(rowNumberPlus, columnNumber, opponent);
            attacks.push(`${rowNumberPlus}${columnNumber}, ${attackResult}`)
            return [attackResult, 'row', rowNumberPlus];
        };
        // rowNumber - 1 check
        let rowNumberMinus = rowNumber - 1;
        result = testAttack(rowNumberMinus, columnNumber, opponent.playerBoard);
        if(result === true) {
            const attackResult = opponent.playerBoard.receiveAttack(rowNumberMinus, columnNumber, opponent);
            attacks.push(`${rowNumberMinus}${columnNumber}, ${attackResult}`)
            return [attackResult, 'row', rowNumberMinus];
        };
        // columnNumber + 1 check
        let columnNumberPlus = columnNumber + 1;
        result = testAttack(rowNumber, columnNumberPlus, opponent.playerBoard);
        if(result === true) {
            const attackResult = opponent.playerBoard.receiveAttack(rowNumber, columnNumberPlus, opponent);
            attacks.push(`${rowNumber}${columnNumberPlus}, ${attackResult}`)
            return [attackResult, 'column', columnNumberPlus];
        }
        // columnNumber - 1 check
        let columnNumberMinus = columnNumber - 1;
        result = testAttack(rowNumber, columnNumberMinus, opponent.playerBoard);
        if(result === true) {
            const attackResult = opponent.playerBoard.receiveAttack(rowNumber, columnNumberMinus, opponent);
            attacks.push(`${rowNumber}${columnNumberMinus}, ${attackResult}`)
            return [attackResult, 'column', columnNumberMinus];
        }
        else {
            return false;
        }
    };

 
    return {playerName, playerBoard, makeAttack}
};

const gameLoop = (name) => {
    // create players
    const humanPlayer = player(name);
    const computerPlayer = player('computer');

    // create the gameboard visuals
    DOM.createGameboardVisual(humanPlayer);
    DOM.createGameboardVisual(computerPlayer);

    // add event listener to 'add ship button'

    // manually placing ships
    /*humanPlayer.playerBoard.placeShip(0, 0, 6, 'chesapeake', 'horizontal');
    humanPlayer.playerBoard.placeShip(5, 7, 3, 'altuna', 'horizontal');
    humanPlayer.playerBoard.placeShip(2, 3, 5, 'peep', 'horizontal');
    humanPlayer.playerBoard.placeShip(8, 3, 5, 'fate', 'horizontal');
    humanPlayer.playerBoard.placeShip(9, 3, 5, 'toot', 'horizontal');
    humanPlayer.playerBoard.placeShip(1, 3, 5, 'feet', 'horizontal');

    computerPlayer.playerBoard.placeShip(0, 5, 3, 'york', 'vertical');
    computerPlayer.playerBoard.placeShip(7, 3, 2, 'pentatonic', 'horizontal');*/

    // make the computer's board responsive
    //DOM.makeGameBoardsAttackable(computerPlayer, humanPlayer);

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
    return {determineWinner, humanPlayer, computerPlayer}
};

const DOM = (() => {
    //document.getElementById('startGame').addEventListener('click', gameLoop);
    

    /* function creates the gameboards, each div in the grid will have the respective coordinate data */
    const createGameboardVisual = (player) => {
        // element that will display player names above their respective gameboards
        let displayName = document.createElement('div');
        let name = document.createElement('h3');
        name.textContent = player.playerName;
        displayName.appendChild(name);

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
        document.getElementById('gameboards').appendChild(displayName);
        document.getElementById('gameboards').appendChild(gameboard);
    };

    const addShip = () => {
        let form = document.getElementById("shipPlacementForm");
        function handleForm(event) { event.preventDefault(); } 
        form.addEventListener('submit', (e) => {
            handleForm(e);
            let shipName = document.querySelector('#shipName').value;
            let coordinate = document.querySelector('#shipCoordinate').value;
            let bothCoordinates = coordinate.split(',');
            let row = parseInt(bothCoordinates[0]);
            let column = parseInt(bothCoordinates[1]);
            let length = parseInt(document.querySelector('#shipLength').value);
            const radios = Array.from(document.querySelectorAll('input[name="orientation"]'));
            const radio = radios.filter(radio => radio.checked);
            const orientation = radio[0].value;
        
            let humanShips = game.humanPlayer.playerBoard.ships
            let computerShips = game.computerPlayer.playerBoard.ships
        
            let humanBoard = game.humanPlayer.playerBoard;
            let computerBoard = game.computerPlayer.playerBoard;
        
            let result = humanBoard.testPlaceShip(row, column, length, orientation, humanShips)
            if(result === 'successful') {
                humanBoard.placeShip(row, column, length, shipName, orientation);
                computerBoard.placeComputerShip(length, computerShips, computerBoard);
                document.querySelector('#shipCreationResult').textContent = '';
                alert('Your Ship Was Successfully Added');
                // if start game button not appended yet, do so, otherwise return
                  // add event listener to start game button(will make the boards attackable, respond to clicks)
                if(!document.querySelector('#startGame')) {
                    let startGameButton = document.createElement('button');
                    startGameButton.id = 'startGame';
                    startGameButton.textContent = 'Start Game';
                    startGameButton.setAttribute('type', 'button');
                    startGameButton.addEventListener('click', () => {
                        // gameboards can now be clicked on
                        DOM.makeGameBoardsAttackable(game.computerPlayer, game.humanPlayer);
                        // user can no longer add more ships
                        document.querySelector('#addShip').classList.add('stopListening');
                    });
                    document.querySelector('#gameControl').appendChild(startGameButton);
                };
            }
            else {
                alert('Your Ship Was NOT Successfully Added')
                return;
            }
        });
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

    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    return {createGameboardVisual, makeGameBoardsAttackable, addShip, getRandomInt}
})();

// set up interactivity upon loading in
let game = gameLoop('human');
DOM.addShip();

//export { shipFactory, gameboardFactory, player, DOM, gameLoop };