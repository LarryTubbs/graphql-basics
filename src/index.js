import myLocation, {message, name, getGreeting} from './myModule';
import add, {subtract} from './math';

console.log(message);
console.log(name);
console.log(myLocation);
console.log(getGreeting(name));
console.log(`1 + 1 = ${add(1,1)}`);
console.log(`5 - 2 = ${subtract(5,2)}`);