/*
    The DashLevel object handles a state
    of the game. I.e. it handles what is 
    being shown in the current panel and
    its related data.

    It takes two values as input:

    @challenges_timeline: A array of objects
    that have two attributes: rounds (the number
    of rounds needed to trigger the challenges) and
    challenges (an array of numbers describing the
    challenges to be applied after that number of
    rounds). Note that the attribute "challenges"
    is stackable. Therefore, you can omit repetitions
    throughout the definition of the timeline.

    @times: A object with the following attributes:
      press_time: The time the player has to press
                  (default 2 seconds)
      step: The amount of seconds that the next 
            turn will have less than the current
            (default 40 ms)

    @overlaid_challenges: The number of allowed
    overlays in a challenge (default 1)
*/

/*  
    v 0.1

    There are five possible configurations
    for the game:
    0 - simple arrow;
    1 - reverse;
    2 - double arrow;
    3 - previous action;
    4 - pressed arrow.

    The order of the directions is:
    0 - left;
    1 - up;
    2 - right;
    3 - down.
*/

// The number of configurations
var CONFIGURATIONS = 5;

// The number of directions
var DIRECTIONS = 4;

// The time the player has to press
var PRESS_TIME = sec2ms(2);

// The amount of seconds that the next
// turn will have less than the current
var STEP = sec2ms(0.04);

// The minimum velocity that the player
// will ever have to dismiss a panel
var MINIMUM_VELOCITY = sec2ms(0.7);

// The constraints in the configurations.
// I.e. if the configuration b in present
// in the constraints of a, then a and b
// can not happen at the same time. A
// configuration a is NOT compatible with a.
var constraints = {
    0: [],
    1: [3, 4],
    2: [3, 4],
    3: [1, 2, 4],
    4: [1, 2, 3]
};

;(function (w) {
    'use strict';

    w.DashLevel = function (challenges_timeline, times, overlaid_challenges) {
        // Mandatory argument
        if (!challenges_timeline || challenges_timeline.length === 0)
            return false;

        // The minimum number of overlaid challenges is 1
        if (overlaid_challenges === undefined)
            overlaid_challenges = 1;

        // Define the times if not set
        if (times === undefined)
            times = {};

        if (times.press_time === undefined)
            times.press_time = PRESS_TIME;

        if (times.step === undefined)
            times.step = STEP;

        // The self handler
        var _ = this;

        // The expected direction array
        _.expected = null;

        // The last expected action
        var last = null;

        // The combination of challenges computed
        _.challenges = null;

        // The raw direction computed
        _.raw = null;

        // The press time
        _.press_time = times.press_time;

        // The number of rounds elapsed
        var rounds = -1;

        // The challenged that can currently be applied
        _.allowed = [];

        // A function that generates a random number
        var rand = function (n) {
           return ~~(Math.random() * n); 
        }

        // The function that feeds _.allowed by adding
        // new allowed challenged
        var update_allowed_challenges = function () {
            if (challenges_timeline.length === 0)
                return;

            var first = challenges_timeline[0];

            if (first.rounds === rounds) {
                _.allowed.push_array(first.challenges);
                challenges_timeline.shift();
            }
        }

        // The function that generates a configuration
        // for the panel (direction and difficulty) and
        // the solution for the puzzle
        var compute_expected = function () {
            var direction = rand (DIRECTIONS);

            var tentative = {
                expected: [direction],
                challenges: []
            }

            _.raw = direction;

            for (var i = 0; i < overlaid_challenges; i++)
                tentative = salt (tentative.expected, tentative.challenges);

            _.expected = tentative.expected;
            _.challenges = tentative.challenges;

            last = _.expected;
        }

        // Add a challenge to the computed expected array
        var salt = function (expected, challenges) {

            var length = challenges.length;
            var reload = false;
            var configuration;

            var values = {
                expected: [],
                challenges: challenges
            };

            while (true) {
                configuration = rand (CONFIGURATIONS);

                // This is the very first turn, and the rand
                // gave last previous as difficulty
                if (last === null && configuration === 3)
                    continue;

                // If the challenge is not allowed, then do it again
                if (!_.allowed.has(configuration))
                    continue;

                // Check for constraint violations for adding a new
                // configuration to the previous one
                for (var i = 0; i < length; i++)
                    if (constraints[challenges[i]].has(configuration))
                        continue;

                break;
            }

            values.challenges.push(configuration);

            switch (configuration) {
                // 0 - simple arrow;
                case 0:
                    values.expected.push(expected[0]);
                break;

                // 1 - reverse
                case 1:
                    var length = expected.length;

                    for (var i = 0; i < length; i++)
                        values.expected.push(mod(expected[i] + 2, 4));
                break;

                // 2 - double arrow
                case 2:
                    values.expected.push(expected[0]);
                    values.expected.push(expected[0]);
                break;

                // 3 - previous action
                case 3:
                    values.expected = last;
                break;

                // 4 - pressed arrow
                case 4:
                    values.expected = [];
                break;
            }

            return values;         
        }

        // The function that increments a new round
        // and make all the logic necessary for a new
        // level
        _.new_round = function () {
            rounds++;
            update_allowed_challenges();

            compute_expected();

            _.press_time -= times.step;
            _.press_time = Math.max(_.press_time, MINIMUM_VELOCITY); 
        }

        // Returns _.rounds
        _.get_rounds = function () {
            return rounds;
        }

    }

}) (window);