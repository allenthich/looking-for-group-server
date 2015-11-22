"use strict";

var TimeService = {
    prettify: function(uglyObject) {
        var newObject = JSON.parse(JSON.stringify(uglyObject));
        newObject['startTime'] = Date.parse(newObject.startTime);
        newObject['endTime'] = Date.parse(newObject.endTime);
        newObject['lockTime'] = Date.parse(newObject.lockTime);
        return newObject;
    }
};

module.exports = TimeService;