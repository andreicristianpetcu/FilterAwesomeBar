// exports.helloObject = {hello: "world"};
console.log('test from common')
const commonlib = {hello: "world"};
if(window){
    window.commonlib = commonlib;
}
// if(exports !== undefined){
//     exports.commonlib = commonlib;
// }