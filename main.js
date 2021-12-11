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
    this.print();
    this.askQuestion();
    if (this.isOutOfBounds()) {
      term.red('Sorry, you are out of bounds');
    } else if (this.isHole()) {
      term.red('Sorry, you fell down a hole');
    } else if (this.isHat()) {
      term.yellow('Congrats, you found your hat!');
    } else {
      this.field[this.playerPrev.y][this.playerPrev.x] = pathCharacter;
      this.field[this.player.y][this.player.x] = character;
      this.runGame();
    }
  }
  solver() {
    /*const hatUp = this.field[hatRow - 1][hatIndex];
    const hatDown = this.field[hatRow + 1][hatIndex];
    const hatLeft = this.field[hatRow][hatIndex - 1];
    const hatRight = this.field[hatRow][hatIndex + 1];*/
    
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
const myField = new Field(example);

myField.runGame();