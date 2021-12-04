const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;
    this.locationX = 0;
    this.locationY = 0;
    this.field[0][0] = pathCharacter;
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
        console.log('Enter r, l, u or d');
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
      console.log('Sorry, you are out of bounds');
    } else if (this.isHole()) {
      console.log('Sorry, you fell down a hole');
    } else if (this.isHat()) {
      console.log('Congrats, you found your hat!');
    } else {
      this.field[this.locationY][this.locationX] = pathCharacter;
      this.runGame();
    }
  }
}
const myField = new Field([
  ['*', '░', 'O'],
  ['░', 'O', '░'],
  ['░', '^', '░']
]);
myField.runGame();