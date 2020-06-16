const concat = require('concat');

(async function build() {
  const files = [
    './dist/powermeet/runtime.js',
    './dist/powermeet/polyfills.js',
    './dist/powermeet/scripts.js',
    './dist/powermeet/main.js'
  ];
  await concat(files, './dist/powermeet/bundle.js');
})();
