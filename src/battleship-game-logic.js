/*hit can take multiple arguments, use rest operator, condition property is array that contains whether
a section is hit, is sunk looks at condition property and checks if each index contains a hit marker,
if they do then the ship is sunk */

const shipFactory = (length) => {
    // based on length of ship, divide ship into sections that can be hit, make representative array
    const createHitZones = (length) => {
        let hitZones = [];
        for(let i = 0; i < length; i++) {
            hitZones.push('not hit');
        }
        return hitZones;
    };

    // an array that keeps track of which sections of the ship have been hit
    const condition = createHitZones(length);

    /* Passes in the section or sections of the ship(an array index) that is/are hit
    and marks the corresponding index(es) as hit in the condition array */
    const hit = (...sectionsOfShipTargeted) => {
        sectionsOfShipTargeted.forEach((section) => {
            condition[section] = 'hit';
        });
        return condition;
    };

    // filter the condition array to see if all indexes contain 'hit', if so the ship is sunk
    const isSunk = () => {
        const filteredCondition = condition.filter(status => status === 'hit');
        // the number of hits(length of the filtered array) should correspond to the length of the ship if it is sunk
        if(filteredCondition.length === length) {
            return true;
        } else {
            return false;
        };
    };

    return {length, hit, isSunk};
};

export { shipFactory };