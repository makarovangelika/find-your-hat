const prompt = require('prompt-sync')({sigint: true});
const term = require( 'terminal-kit' ).terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const playerCharacter = '*';
const pathCharacter = 'x';

class Field {
  constructor(field, hard) {
    this.field = field;
    this.hard = hard;
    //Create the array with coordinates of free fields which aren't holes
    this.freeFields = [];
    this.field.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === fieldCharacter) {
          this.freeFields.push({y: y, x: x})
        }
      });
    });
    //Shuffle the array of free fields' coordinates
    //It makes the choice of the field for the hat and the starting point random
    if (this.freeFields.length >= 2) {
      this.freeFields.sort((a, b) => 0.5 - Math.random());
    } else {
      throw 'Not enough free fields';
    }
    //Choose the hat from the shuffled array of free fields' coordinates
    this.hat = this.freeFields.pop();
    this.field[this.hat.y][this.hat.x] = hat;
    //Choose the starting point from the shuffled array of free fields' coordinates
    this.player = this.freeFields[Math.floor(Math.random() * this.freeFields.length)];
    //Create the property of previous position of the player and assign the coordinates of the starting point to it
    //This property allows to distinguish the current position of the player and the path they made
    this.playerPrev = {x: this.player.x, y: this.player.y}
    this.field[this.player.y][this.player.x] = playerCharacter;
  }
  print() {
    function arrayToString(item) {
      let string = item.join('');
      console.log(string);
    }
    this.field.forEach(arrayToString);
  }
  askQuestion() {
    const direction = prompt('Which way?');
    this.playerPrev.x = this.player.x
    this.playerPrev.y = this.player.y
    switch (direction) {
      case 'r':
        this.player.x += 1;
        break;
      case 'l':
        this.player.x -= 1;
        break;
      case 'd':
        this.player.y += 1;
        break;
      case 'u':
        this.player.y -= 1;
        break;
    }
  }
  isHat() {
    return this.field[this.player.y][this.player.x] === hat;
  }
  isHole() {
    return this.field[this.player.y][this.player.x] === hole;
  }
  isOutOfBounds() {
    return (
    this.player.y < 0 ||
    this.player.y >= this.field.length ||
    this.player.x < 0 ||
    this.player.x >= this.field[0].length);
    }
  runGame() {
    if (!this.canBeSolved()) {
      this.print();
      term.red("Sorry, this field can't be solved. Run the game again\n");
      return;
    }
    const mode = prompt('Would you like to play the hard mode of the game?');
    if (mode === 'y' || mode === 'yes') {
      this.hard = true;
    }     
    let askCounter = 0;
    while (true) {
      //Checking if the game is in the hard mode and the current turn is after every third turn
      if (this.hard && askCounter % 3 === 0 && askCounter > 0) {
        this.addHole();
        if (!this.canBeSolved()) {
          this.print();
          term.red("Sorry, this field can't be solved. Run the game again\n");
          break;
        }
      }
      this.print();
      this.askQuestion();
      askCounter++;
      if (this.isOutOfBounds()) {
        term.red('Sorry, you are out of bounds');
        break;
      } else if (this.isHole()) {
        term.red('Sorry, you fell down a hole');
        break;
      } else if (this.isHat()) {
        term.yellow('Congrats, you found your hat!');
        break;
      }
      this.field[this.playerPrev.y][this.playerPrev.x] = pathCharacter;
      this.field[this.player.y][this.player.x] = playerCharacter;
    }
  }
  addHole() {
    //Create the array of free fields excluding the player position to prevent adding new holes at this position
    let freeFieldsFilter = this.freeFields.filter(field => field.x !== this.player.x || field.y !== this.player.y);
    if (freeFieldsFilter.length > 0) {
      let newHole = freeFieldsFilter.pop();
      this.field[newHole.y][newHole.x] = hole;
      //Update the array of free fields to exclude previously added hole
      this.freeFields = freeFieldsFilter;
    }
  }
  canBeSolved() {
    //Create two-dimensional array which will contain group IDs for every field
    //For now fields with holes will be marked as "-1" and all other fields - as "null"
    const fieldGroups = [];
    this.field.forEach(row => {
      const rowGroups = [];
      row.forEach(cell => {
        if (cell === hole) {
          rowGroups.push(-1);
        } else {
          rowGroups.push(null);
        }
      });
      fieldGroups.push(rowGroups);
    });

    //Function which gets IDs of neigbour fields from the array of group IDs
    function getNeighbours(y, x) {
      let neighbours = [];
      if (y - 1 >= 0) {
        neighbours.push(fieldGroups[y-1][x]);
      }
      if (x - 1 >= 0) {
        neighbours.push(fieldGroups[y][x - 1]);
      }
      return neighbours.filter(neighbour => neighbour !== -1 && neighbour !== null);
    }

    let groupId = 0;
    let parents = {};

    function getRoot(id) {
      while (parents.hasOwnProperty(id)) {
        id = parents[id];
      }
      return id;
    }

    //Fill the "null" fields of the array of group IDs with IDs
    for (let y = 0; y < fieldGroups.length; y++) {
      let row = fieldGroups[y];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        if (cell !== null) {
          continue;
        }
        let neighbours = getNeighbours(y, x);
        if (neighbours.length > 0) {
          //Assign the group ID of the first neighbour field to the processed field
          let currentGroup = neighbours[0];
          fieldGroups[y][x] = currentGroup;
          if (neighbours.length > 1) {
            let neighbourGroup = neighbours[1];
            //Find the roots of both neighbour groups
            let currentGroupRoot = getRoot(currentGroup);
            let neighbourGroupRoot = getRoot(neighbourGroup);
            //Merge the roots of intersecting groups
            if (currentGroupRoot !== neighbourGroupRoot) {
              parents[currentGroupRoot] = neighbourGroupRoot;
            }
          }
        } else {
          //Create a new group for the fields which don't intersect with processed fields
          groupId++;
          fieldGroups[y][x] = groupId;
        }
      }
    }
    //Check if the root groups of the field with hat and the starting field are the same
    //If it's true, these fields are from the common group and the player can go from one point to another
    return getRoot(fieldGroups[this.hat.y][this.hat.x]) === getRoot(fieldGroups[this.player.y][this.player.x]);
  }
  static generateField(height, width, percentage = 0.1) {
    const field = new Array(height).fill(0).map(el => new Array(width));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const random = Math.random();
        field[y][x] = random > percentage ? fieldCharacter : hole;
      }
    }
    return field;
  }
}

const example = [
  ['O', 'O', '░', 'O'],
  ['░', '░', '░', '░'],
  ['O', '░', '░', 'O'],
  ['O', '░', 'O', '░'],
  ['░', '░', 'O', 'O'],
  ['░', 'O', 'O', '░'],
]

const myField = new Field(Field.generateField(5, 5, 0.2));
myField.runGame();