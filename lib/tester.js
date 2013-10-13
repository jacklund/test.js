var util = require('util');

// Find the setup & teardown
function attachSetupTeardown(test, which) {
  if (require.main.exports[which]) {
    var type = typeof(require.main.exports[which]);
    if (type == 'function') {
      test[which] = require.main.exports[which];
    } else if (type == 'object') {
      if (require.main.exports[which][k]) {
        test[which] = require.main.exports[which][k];
      }
    } else {
      throw new Error("Unknown %s type '%s'", which, type);
    }
  }
}

// Get all functions in module.exports that start with "test"
function getTests() {
  var tests = [];
  var patt = /^test/;
  for (var k in require.main.exports) {
    if (patt.test(k)) {
      var test = {name: k, func: require.main.exports[k]};
      attachSetupTeardown(test, 'setup');
      attachSetupTeardown(test, 'teardown');
      tests.push(test);
    }
  }

  return tests;
}

// Timeout value
var timeout = 15000;
module.exports.setTimeout = function(time) {
  timeout = time;
}

// Main test runner
module.exports.runTests = function() {
  // Grab the arguments and turn them into an array
  var args = [];
  for (var i = 0; i < arguments.length; i++)
    args.push(arguments[i]);

  // Get all the test functions
  var tests = getTests();
  var currentTest = null;

  // Run the next test
  module.exports.nextTest = nextTest = function() {
    var red = '\u001b[31;1m';
    var green = '\u001b[32;1m';
    var blue = '\u001b[34;1m';
    var reset = '\u001b[0m';

    // If we just finished running a test, check for success
    if (currentTest) {
      if (currentTest.success) {
        console.log("%ssucceeded!%s", green, reset);
      } else {
        console.log("%sfailed!%s", red, reset);
        if (currentTest.err) {
          if (currentTest.err.stack) console.log(currentTest.err.stack);
          else console.log(currentTest.err);
        }
      }

      // Run the teardown after
      if (currentTest.teardown) {
        try {
          currentTest.teardown.apply(this, args);
        } catch (err) {
          err.stacktrace = "Error in test teardown: " + err.stacktrace;
          return nextTest();
        }
      }
    }

    // Get the next test
    currentTest = tests.shift();
    if (currentTest) currentTest.success = true;

    // Create the callback wrapper function
    module.exports.createCallback = function(f) {
      // Set the timer for the callback
      var id = setTimeout(function() {
        console.log("Timeout getting callback for %s", currentTest.name);
        currentTest.success = false;
        nextTest();
      }, timeout);

      // Return the callback wrapper function
      return function() {
        // Turn off the timer
        clearTimeout(id);

        // Gather the arguments
        var args = [];
        for (var i = 0; i < arguments.length; i++)
          args.push(arguments[i]);

        // Call the wrapped callback
        try {
          f.apply(this, args);
          currentTest.success = true;
        } catch (err) {
          currentTest.err = err;
          currentTest.success = false;
          nextTest();
        }
      }
    }

    // If we have a test to run, run it
    if (currentTest) {
      process.stdout.write(currentTest.name + "...");

      // Run the setup first
      if (currentTest.setup) {
        try {
          currentTest.setup.apply(this, args);
        } catch (err) {
          err.stacktrace = "Error in test setup: " + err.stacktrace;
          return nextTest();
        }
      }

      // Run the test
      try {
        currentTest.func.apply(this, args);
        currentTest.success = true;
      } catch (err) {
        currentTest.err = err;
        currentTest.success = false;
        return nextTest();
      }
    } else {
      console.log("Done!");
      process.exit(0);
    }
  }

  // Start the tests
  nextTest();
}
