test.js
=======

Node.js testing framework

I wrote this, despite the fact that there are many fine Node.js testing frameworks out there, because I wanted
something simple.

Using test.js is easy - just create a node.js file and add your tests as functions which are exported via `module.exports`.
Any function which begins with 'test' will be considered part of the test suite. Additionally, you can export a
`setup` and `teardown`. If these are functions, they will be run before and after every test. If they are objects, you can
map individual setup/teardown functions to individual tests.

## Setup and Teardown
So, for instance, if I wanted a single setup/teardown for all my tests:

    module.exports.setup = function() {
      // Setup code here
    }
    
    module.exports.teardown = function() {
      // Teardown code here
    }
    
    module.exports.testA = function() {
      // first test
    }

and so on. On the other hand, you could also do this:

    module.exports.testA = function() {
      // test A
    }
    
    module.exports.testB = function() {
      // test B
    }
    
    module.exports.setup = {
      testA: function() {
        // test A setup
      },
      
      testB: function() {
        // test B setup
      }
    }

## Running Tests
Construct tests using the Node.js `assert` functions.
Within each test, if the test is completed, you need to call `nextTest()`.
To run the tests, just call `runtests()`:

    var tester = require('test.js');
    
    module.exports.testSomething = function() {
      assert(a == b);
      tester.nextTest();
    }
    
    module.exports.testSomethingElse = function() {
      // Test code here
      assert(something == somethingElse);
      tester.nextTest();
    }
    
    tester.runTests();

The framework will automatically catch the asserts and any exceptions that are thrown. Also, if you have any
parameters that you want passed into your test functions, just pass those parameters into `runTests()` - they'll be
passed into all your tests, setups, and teardowns.

## Callbacks
If your test code creates callbacks, you need to wrap them in `createCallback()`, like so:

    module.exports.testSomething = function() {
      someFunction(createCallback(function(err, a) {
        assert.equal(a, 1);
        tester.nextTest();
      }));
    }

You can have as many wrapped callbacks in your tests as you want.
