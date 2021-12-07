const prompt = require('prompt-sync')({sigint: true});
const term = require( 'terminal-kit' ).terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;
    this.locationX = Math.floor(Math.random() * this.field[0].length);
    this.locationY = Math.floor(Math.random() * this.field.length);
    this.field[this.locationY][this.locationX] = pathCharacter;
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
    switch (direction) {
      case 'r':
        this.locationX += 1;
        break;
      case 'l':
        this.locationX -= 1;
        break;
      case 'd':
        this.locationY += 1;
        break;
      case 'u':
        this.locationY -= 1;
        break;
      default:
        term.red('Enter r, l, u or d');
        this.askQuestion();
        break;
    }
  }
  isHat() {
    return this.field[this.locationY][this.locationX] === hat;
  }
  isHole() {
    return this.field[this.locationY][this.locationX] === hole;
  }
  isOutOfBounds() {
    return (
    this.locationY < 0 ||
    this.locationY >= this.field.length ||
    this.locationX < 0 ||
    this.locationX >= this.field[0].length);
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
      this.field[this.locationY][this.locationX] = pathCharacter;
      this.runGame();
    }
  }
  static generateField(height, width, percentage = 0.1) {
    const field = new Array(height).fill(0).map(el => new Array(width));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const random = Math.random();
        field[y][x] = random > percentage ? fieldCharacter : hole;
      }
    }
    const hatLocation = {
      y: Math.floor(Math.random() * height),
      x: Math.floor(Math.random() * width)
    }
    while (hatLocation.y === this.locationY && hatLocation.x === this.locationX) {
      hatLocation.y = Math.floor(Math.random() * height);
      hatLocation.x = Math.floor(Math.random() * width);
    }
    field[hatLocation.y][hatLocation.x] = hat;
    return field;
  }
}
const myField = new Field(Field.generateField(7, 7, 0.2));
myField.runGame();