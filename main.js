const prompt = require('prompt-sync')({sigint: true});
const term = require( 'terminal-kit' ).terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const character = 'p';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;
    const freeFields = [];
    this.field.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === fieldCharacter) {
          freeFields.push({x: x, y: y})
        }
      });
    });
    if (freeFields.length >= 2) {
      freeFields.sort((a, b) => 0.5 - Math.random());
    } else {
      throw 'Not enough free fields';
    }

    this.player = freeFields.pop();
    this.playerPrev = {x: this.player.x, y: this.player.y}
    this.field[this.player.y][this.player.x] = character;

    this.hat = freeFields.pop();
    this.field[this.hat.y][this.hat.x] = hat;
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
      default:
        term.red('Enter r, l, u or d');
        this.askQuestion();
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
    while (true) {
      this.print();
      this.askQuestion();
      if (this.isOutOfBounds()) {
        term.red('Sorry, you are out of bounds');
        break;
      } else if (this.isHole()) {
        term.red('Sorry, you fell down a hole');
        break;
      } else if (this.isHat()) {
        term.yellow('Congrats, you found your hat!');
        break;
      } else {
        this.field[this.playerPrev.y][this.playerPrev.x] = pathCharacter;
        this.field[this.player.y][this.player.x] = character;
      }
    } 
  }
  canBeSolved() {
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

    function mergeGroups(MergeInGroup, groupToMerge) {
      for (let y = 0; y < fieldGroups.length; y++) {
        let row = fieldGroups[y];
        for (let x = 0; x < row.length; x++) {
          let cell = row[x];
          if (groupToMerge === cell) {
            fieldGroups[y][x] = MergeInGroup;
          }
        }
      }
    }

    let groupId = 0;
    for (let y = 0; y < fieldGroups.length; y++) {
      let row = fieldGroups[y];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        if (cell !== null) {
          continue;
        }
        let neighbours = getNeighbours(y, x);
        if (neighbours.length > 0) {
          fieldGroups[y][x] = neighbours[0];
          if (neighbours.length > 1) {
            mergeGroups(neighbours[0], neighbours[1]);
          }
        } else {
          groupId++;
          fieldGroups[y][x] = groupId;
        }
      }
    }
    return fieldGroups[this.hat.y][this.hat.x] === fieldGroups[this.player.y][this.player.x];
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
const myField = new Field(Field.generateField(5, 5, 0.4));
if (!myField.canBeSolved()) {
    myField.print();
    term.red("Sorry, this field can't be solved. Run the game again\n");
} else {
  myField.runGame();
}
