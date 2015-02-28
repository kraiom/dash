/*
    The DashGUI object handles the
    properties related to the UI and
    how they are applied and where.

    There are three attributes, two of which
    are mandatory:

    @elements: an object with the following attributes:
        - panels: an array of the panels' ids being used
        - icons: an array of the icons' ids being used
        - score: an object whose attribute "main" represents
        the main DOM which must be displayed for the score;
        The attribute "timer" represents the timer that will
        have its width changed from 0% to 100% in the remaining
        time; The attribute "lives" represent the container of
        children that will be accessed through :nth-child, and 
        will be disabled in reverse order; The attribute "points"
        is the DOM in which the score must be displayed.

    @defaults: an object with the following attributes:
        - presets: The number or presets to be used

        - panel: The default class for the panels. Any "*"
        will be replaced by a generated number; Any "." will
        be replaced by the corresponding value in replace_array.

        - icon: The default class for the icons. Any "*"
        will be replaced by a generated number; Any "." will
        be replaced by the corresponding value in replace_array.

        - replace_array: An optional argument that enables more
        flexibility when naming the classes to be used. The strings
        containing "." will have the corresponding number translated
        regarding this array.

        - wrong_icon: The class that the icon should have once the
        player got it wrong. If it starts with a "+", then the class
        will be added, instead of replaced.

        - correct_icon: The class that the icon should have once the
        player got it correct. If it starts with a "+", then the class
        will be added, instead of replaced.

        - life_lost: The class that the life icon should have once the
        player got it wrong. If it starts with a "+", then the class
        will be added, instead of replaced.

    @specifics: TODO

    @drop_time: The time taken by the panel to appear. (Default 700 ms).
*/

// The number of directions
var DIRECTIONS = 4;

;(function (w) {
    'use strict';

    w.DashGUI = function (elements, defaults, specifics, drop_time) {
        // The self handler
        var _ = this;

        // Default value for drop_time
        drop_time = drop_time ? drop_time : 700;

        // A variable that does not allow color repetition
        var queue = [];

        // The current panel being displayed
        var current = 1;

        // The number of panels
        var N_PANELS = elements.panels.length;

        // The current direction
        _.direction = null;

        // Direction animations
        var positions = [
            {x: '100%', y: '0'},
            {x: '0', y: '100%'},
            {x: '-100%', y: '0'},
            {x: '0', y: '-100%'}
        ];

        // Converts strings into jQuery selectors
        for (var i = 0; i < elements.panels.length; i++)
            elements.panels[i] = $(elements.panels[i]);

        for (var i = 0; i < elements.icons.length; i++)
            elements.icons[i] = $(elements.icons[i]);

        for (var i in elements.score)
            elements.score[i] = $(elements.score[i]);

        // A function that picks a random preset and queue it
        var get_preset = function () {
            var preset;

            do { 
                preset = ~~(Math.random() * defaults.presets);
            } while (queue.has(preset));

            queue.push(preset);

            if (queue.length >= (defaults.presets / 2))
                queue.shift();

            return preset;
        }

        // A helper function that interprets a class name given a number
        // returns an object with the following attributes: 
        // - addClass: boolean, represent whether or not the class must be added
        //        instead of replaced.
        // - class_name: string, represents the class name to be used
        var interpret = function (class_name, index) {
            var values = {addClass: false, class_name: class_name};

            if (class_name.charAt(0) === '+') {
                values.addClass = true;
                class_name = class_name.substr(1);
            }

            if (index !== undefined) {
                class_name = class_name.replace(/\*/g, index);

                if (defaults.replace_array[index] !== undefined)
                    class_name = class_name.replace(/\./g, defaults.replace_array[index]);
            }

            values.class_name = class_name;
            return values;
        }

        // Helper function that toggle classes in a object
        var toggle_class = function (object, addClass, class_name) {
            if (addClass)
                object.addClass(class_name);
            else
                object.removeClass().addClass(class_name);
        }

        // The function that displays a panel when requested
        _.retrieve = function (direction, callback) {
            _.direction = direction;

            var preset = get_preset();

            var next = mod(current + 1, N_PANELS);

            elements.panels[current].css('z-index', 0);
            elements.panels[next].css('z-index', 1);

            current = next;

            var class_data = interpret(defaults.panel, preset);
            toggle_class(elements.panels[current], class_data.addClass, class_data.class_name);

            var class_data = interpret(defaults.icon, direction);
            toggle_class(elements.icons[current], class_data.addClass, class_data.class_name);

            var die = ~~(Math.random() * DIRECTIONS);
            var pos = positions[die];

            elements.panels[current].css({left: pos.x, top: pos.y});

            elements.panels[current].animate({left: 0, top: 0}, drop_time, callback);
        }

        // The function that resets all data to start over
        _.prepare = function () {
            elements.score.points.html(0);
            elements.score.main.fadeIn();

            for (var i = 0; i < elements.panels.length; i++)
                elements.panels[i].css({
                    top: '-100%', 
                    left: '-100%',
                    display: 'block'
                });

            elements.score.timer.css('width', 0);

            var class_data = interpret(defaults.life_lost);
            elements.score.lives.removeClass(class_data.class_name);
        }

        // The function that dismiss all panels
        _.dismiss = function () {
            for (var i = 0; i < elements.panels.length; i++)
                elements.panels[i].fadeOut();

            elements.score.main.fadeOut();
        }

        // Changes panel when the user gets wrong
        _.fails = function (remaining) {
            remaining--;

            var class_data = interpret(defaults.wrong_icon, _.direction);
            toggle_class(elements.icons[current], class_data.addClass, class_data.class_name);

            var class_data = interpret(defaults.life_lost);
            toggle_class(elements.score.lives.eq(remaining), class_data.addClass, class_data.class_name);
        }

        // Changes panel when the user gets correct
        _.scores = function (points) {
            elements.score.points.html(points);

            var class_data = interpret(defaults.correct_icon, _.direction);
            toggle_class(elements.icons[current], class_data.addClass, class_data.class_name);
        }

        // Starts the timer
        _.tic = function (time) {
            elements.score.timer.css('width', 0).animate({width: '100%'}, time);
        }

        // Stops the timer
        _.toc = function () {
            elements.score.timer.stop();
        }


    }

}) (window);