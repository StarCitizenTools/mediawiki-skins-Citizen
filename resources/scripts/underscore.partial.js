/*
 Copyright (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative
 Reporters & Editors

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */
/*
 This is a partial version of the library that only includes a few
 underscore methods.
 */
/* eslint-disable */
var _ = _ || {};

_.now = Date.now || function() {
		return new Date().getTime();
	};

_.throttle = function(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) { options = {};
	}
	var later = function() {
		previous = options.leading === false ? 0 : _.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) { context = args = null;
		}
	};
	return function() {
		var now = _.now();
		if (!previous && options.leading === false) { previous = now;
		}
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) { context = args = null;
			}
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
};

_.debounce = function(func, wait, immediate) {
	var timeout, args, context, timestamp, result;

	var later = function() {
		var last = _.now() - timestamp;

		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				if (!timeout) { context = args = null;
				}
			}
		}
	};

	return function() {
		context = this;
		args = arguments;
		timestamp = _.now();
		var callNow = immediate && !timeout;
		if (!timeout) { timeout = setTimeout(later, wait);
		}
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};
};
