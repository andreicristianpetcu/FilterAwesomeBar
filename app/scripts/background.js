// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

// browser.runtime.onInstalled.addListener((details) => {
//   console.log('previousVersion', details.previousVersion)
// })

// console.log("helloObject");
if (window.commonlib) {
  window.commonlib.runInBackground(browser);
}