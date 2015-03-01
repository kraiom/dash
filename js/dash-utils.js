/*
    Dash v 0.3  | (c) 2015 Breno Lima de Freitas - breno.io | Licensed under CC-NC-ND
*/

// Function that converts sec to ms
function sec2ms (sec) {
    return sec * 1000;
}

// Function that calculates the interger modulus
function mod (n, m) {
    return ((n % m) + m) % m;
}

// A prototype that evaluates whether or not an 
// item is in the array.
Array.prototype.has = (function (item) {
    var length_a = this.length;

    for (var i = 0; i < length_a; i++)
        if (this[i] === item)
            return true;

    return false;
});

// A prototype that copies all elements
// of target to the main array. Returns
// the new arrray.
Array.prototype.push_array = (function (target) {
    var length_a = target.length;

    for (var i = 0; i < length_a; i++)
        this.push(target[i]);

    return this;
});

// Check if two arrays are equal.
Array.prototype.compare = (function (target) {
    var length_a = this.length;

    if (length_a !== target.length)
    	return false;

    for (var i = 0; i < length_a; i++)
        if (this[i] !== target[i])
        	return false;

    return true;
});
