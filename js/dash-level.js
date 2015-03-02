/*
    Dash v 0.4  | (c) 2015 Breno Lima de Freitas - breno.io | Licensed under CC-NC-ND

    The DashLevel object handles a state
    of the game. I.e. it handles what is 
    being shown in the current panel and
    its related data.

    FYI, The order of the directions is:
        0 - left;
        1 - up;
        2 - right;
        3 - down.

    It takes three values as input:

    @challenges: The attribute that defines
    the challenges to be faced. It is an array
    of objects. Notice that the order IS important
    because they are going to be indexed in the
    given order. This object must comprise three
    attributes:
        - first_turn: a boolean that defines whether
        or not the challenge can occur in the very
        first turn. (default true).

        - constraints: an array of numbers defining
        which other challenges cannot overlap this 
        one. Note that every challenge is self exclusive. 
        Note that if @overlaid_challenges is 1, then this
        attribute has no effect, since no challenge will
        ever be overlapped. (default []).

        - rounds: The minimum number of rounds (inclusive)
        that this challenge can occur. It will not occur
        prior this specified number of rounds. (default 0).

        - morph: a function that must return an object
        that is a modification of the input one. This 
        function is explained below.

    @times: A object with the following attributes:
      press_time: The time the player has to press
                  (default 2 seconds)
      step: The amount of seconds that the next 
            turn will have less than the current
            (default 40 ms)

    @overlaid_challenges: The number of allowed
    overlays in a challenge (default 1)

    The "morph" function is the most important
    function when defining a challenge. And has 
    the following flavour:
    
    function morph (tentative, last) {};

    @tentative is a object that has three attributes.
    Namely:
        - missable: a boolean that defines whether 
        or not the challenge is not satisfied if the
        player runs out of time.

        - challenges: an array of indexes of challenges
        being currently applied.

        - expected: an array defining the expected sequence
        of keys in [0, 3].

    @last is an object with the following attributes:
        - expected: the last array defining the expected 
        sequence of keys in [0, 3].

        - missable: the last boolean that defines whether 
        or not the challenge is not satisfied if the
        player runs out of time.

    Both @tentative and @last are read-only objects. DO
    NOT change ANY of their contents, it will make the
    game to explode into pieces!

    After the logic of the challenge, the user must
    return object containing a missable and a expected
    parameter based on the logic for the challenge. The
    missable parameter is still optional.
*/

;(function (w) {
    'use strict';

    w.DashLevel = function (challenges, times, overlaid_challenges) {
        // Mandatory argument
        if (!challenges)
            return false;

        // The number of configurations
        var CONFIGURATIONS = challenges.length;

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

        // Applying defaults for challenges
        for (var i = 0; i < CONFIGURATIONS; i++) {
            var current = challenges[i];

            if (current.morph === undefined) {
                challenges[i] = null;
                continue;
            }

            if (current.first_turn === undefined)
                current.first_turn = true;

            if (current.rounds === undefined)
                current.rounds = 0;

            if (current.constraints === undefined)
                current.constraints = [];
        }

        // Initializing the timeline array
        var challenges_timeline = [];

        for (var i = 0; i < CONFIGURATIONS; i++) {
            var current = challenges[i];

            if (current === null)
                continue;

            var timeline = {
                index: i, 
                rounds: current.rounds
            };

            challenges_timeline.push(timeline);
        }

        // Checks whether there are still valid
        // challenges in order to continue;
        if (challenges_timeline.length === 0)
            return false;

        // Sorts by earlier rounds
        challenges_timeline.sort(function (a, b) {
            return a.rounds - b.rounds;
        });

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

        if (times.minimun_velocity === undefined)
            times.minimun_velocity = MINIMUM_VELOCITY;

        // The self handler
        var _ = this;

        // The expected direction array
        _.expected = null;

        // The last expected action
        var last = {expected: null, missable: null};

        // The combination of challenges computed
        _.challenges = null;

        // The raw direction computed
        _.raw = null;

        // The press time
        _.press_time = times.press_time;

        // Determines whether or not the current
        // challenge is missable. I.e. the player
        // will get a wrong after the time finishes
        _.missable = true;

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
                _.allowed.push(first.index);
                challenges_timeline.shift();
                update_allowed_challenges();
            }
        }

        // The function that generates a configuration
        // for the panel (direction and difficulty) and
        // the solution for the puzzle
        var compute_expected = function () {
            var direction = rand (DIRECTIONS);

            var tentative = {
                expected: [direction],
                challenges: [],
                missable: true
            }

            _.raw = direction;

            for (var i = 0; i < overlaid_challenges; i++)
                tentative = salt (tentative);

            _.expected = tentative.expected;
            _.challenges = tentative.challenges;
            _.missable = tentative.missable;

            last = {expected: _.expected, missable: _.missable};
        }

        // Add a challenge to the computed expected array
        var salt = function (tentative) {
            var expected = tentative.expected;

            var length = tentative.challenges.length;
            var reload = false;
            var current, index;

            while (true) {
                index = rand(CONFIGURATIONS);
                current = challenges[index];

                // This is the very first turn and the challenge
                // cannot happen in the first turn
                if (rounds === 0 && !current.first_turn)
                    continue;

                // If the challenge is not allowed, then do it again
                if (!_.allowed.has(index))
                    continue;

                // Check for constraint violations for adding a new
                // configuration to the previous one
                for (var i = 0; i < length; i++) {
                    var applied = tentative.challenges[i];

                    if (applied.constraints.has(index))
                        continue;
                }

                break;
            }

            tentative.challenges.push(index);

            var computed = current.morph(tentative, last);

            if (computed.missable === undefined)
                computed.missable = true;

            return {
                expected: computed.expected,
                challenges: tentative.challenges,
                missable: computed.missable
            };
        }

        // The function that increments a new round
        // and make all the logic necessary for a new
        // level
        _.new_round = function () {
            rounds++;
            update_allowed_challenges();

            compute_expected();

            _.press_time -= times.step;
            _.press_time = Math.max(_.press_time, times.minimun_velocity); 
        }

        // Returns _.rounds
        _.get_rounds = function () {
            return rounds;
        }

    }

}) (window);