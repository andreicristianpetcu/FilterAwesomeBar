// exports.helloObject = {hello: "world"};
console.log(`'Allo 'Allo! Common.js`)
const commonlib = {hello: "world"};
if(window){
    window.commonlib = commonlib;
}
// if(exports !== undefined){
//     exports.commonlib = commonlib;
// }