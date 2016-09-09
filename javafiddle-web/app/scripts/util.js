'use strict';

window.DF = {
  util: {
    runFixedRate: function (fn, rate, activeRate) {
      var timeout, lastUpdate = 0, lastArgs = null, _this = this;
      var runFn = function () {
        if ((Date.now() - lastUpdate) < activeRate) {
          clearTimeout(timeout);
        } else {
          lastUpdate = Date.now();
        }
        var args = arguments;
        timeout = setTimeout(function () {
          fn.apply(_this, args);
          lastArgs = args;
          lastUpdate = Date.now();
        }, rate);
      };
      var prevOnbeforeupload = window.onbeforeunload;
      window.onbeforeunload = function () {
        if (lastUpdate > 0) {
          fn.apply(_this, lastArgs);
        }
        if (prevOnbeforeupload) prevOnbeforeupload();
      };
      return runFn;
    }
  }
};
