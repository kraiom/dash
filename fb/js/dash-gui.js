/*
    Dash v 0.4  | (c) 2015 Breno Lima de Freitas - breno.io | Licensed under CC-NC-ND

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
        time (Note that timer.parent will disappear if hide_timer
        is called) The attribute "lives" represent the container of
        children that will be accessed through :nth-child, and 
        will be disabled in reverse order; The attribute "points"
        is the DOM in which the score must be displayed.

    @defaults: an object with the following attributes:
        
        - base_index: The z-index for the lowest element.
        (default 0).

        - presets: The number or presets to be used

        - panel: The default class for the panels.

        - icon: The default class for the icons.

        - replace_array: An optional argument that enables more
        flexibility when naming the classes to be used. 

        - wrong_icon: The class that the icon should have once the
        player got it wrong.

        - correct_icon: The class that the icon should have once the
        player got it correct.

        - life_lost: The class that the life icon should have once the
        player got it wrong. 

        Any class selector used will be first interpreted regarding the
        following wild cards: 
            - If it starts with a "+", then the class will be added, 
            instead of replaced;

            - Any "*" will be replaced by a generated number;

            - Any "." will be replaced by the corresponding value in 
            replace_array.
        
        For instance, if we have classes "icon-left", "icon-right", (...),
        "bg-0", "bg-1", (...), we may use the selectors "icon-." and "bg-*"
        having replace_array = ['left', 'right', (...)].

    @specifics: A object that should index possible modifiers when calling
    DashGUI.retrieve. Each entry should be an object with two attributes,
    namely "panel" and "icon", just as explained before, that will extend
    the style applied to the panel.

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

        // The z-index base
        var zIndex = 0;

        if (defaults.base_index !== undefined)
            zIndex = defaults.base_index;

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

        // Function that returns the panels that are going
        // to be considered
        _.getPanels = function () {
            return elements.panels;
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

        // Minifier/helper function that calls interpret/toggle_class
        // for the object given the class_name to be interpreted and
        // the integer index to be considered.
        var shape = function (object, class_name, index) {
            var class_data = interpret(class_name, index);
            toggle_class(object, class_data.addClass, class_data.class_name);
        }

        // The function that displays a panel when requested. It takes
        // three parameters. @direction is the raw arrow direction that
        // should be displayed. @modifier is an array of indexes for a 
        // specific style that must be applied. @callback is the function
        // called once the panel is fully displayed.
        _.retrieve = function (direction, modifier, callback) {
            _.direction = direction;

            var preset = get_preset();

            var next = mod(current + 1, N_PANELS);

            elements.panels[current].css('z-index', zIndex);
            elements.panels[next].css('z-index', zIndex + 1);

            current = next;

            var length = modifier.length;
            var panel = elements.panels[current];
            var arrow = elements.icons[current];

            shape(panel, defaults.panel, preset);
            shape(arrow, defaults.icon, direction);
    
            for (var i = 0; i < length; i++) {
                if (modifier[i] in specifics) {
                    var style = specifics[modifier[i]];

                    if (style.panel)
                        shape(panel, style.panel, preset);

                    if (style.icon)
                        shape(arrow, style.icon, direction);
                }
            }

            var die = ~~(Math.random() * DIRECTIONS);
            var pos = positions[die];

            panel.css({left: pos.x, top: pos.y});
            panel.animate({left: 0, top: 0}, drop_time, callback);
        }

        // The function that resets all data to start over
        _.prepare = function () {
            elements.score.main.css('z-index', 2 * (zIndex + 1));

            elements.score.timer.parent().fadeIn();
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

            shape(elements.icons[current], defaults.wrong_icon, _.direction);

            if (elements.score.lives.eq(remaining) !== undefined)
                shape(elements.score.lives.eq(remaining), defaults.life_lost);
        }

        // Changes panel when the user gets correct
        _.scores = function (points) {
            elements.score.points.html(points);

            shape(elements.icons[current], defaults.correct_icon, _.direction);
        }

        // Starts the timer
        _.tic = function (time) {
            if (elements.score.timer.parent().css('display') === 'block')
                elements.score.timer.css('width', 0).animate({width: '100%'}, time);
        }

        // Stops the timer
        _.toc = function () {
            elements.score.timer.stop();
        }

        // Hides the timer from gameplay
        _.hide_timer = function () {
            _.toc();
            elements.score.timer.parent().fadeOut();
        }
    }

}) (window);