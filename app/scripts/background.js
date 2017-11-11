// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

console.log(`'Allo 'Allo! Event Page`)
// console.log("helloObject");
// window.mybackground = {hello: "background"};
console.log(window.commonlib);
