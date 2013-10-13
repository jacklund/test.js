var tester = require('../index.js');

module.exports.setup = function() {
  console.log("Running setup");
}

module.exports.teardown = function() {
  console.log("Running teardown");
}

module.exports.testFirst = function() {
  console.log("Running test");
  tester.nextTest();
}

tester.runTests();
