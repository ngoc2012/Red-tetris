// import glob from 'glob'

// console.log(__dirname)
// const files = glob.sync("src/server#<{(||)}>#*.js")
// files.forEach(file => {
//   console.log(file)
//   require('../' + file)
// })
import * as glob from 'glob';  // Correct import for CommonJS module

// // Example usage of glob
// glob('**/*.js', function (err, files) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(files);
//   }
// });