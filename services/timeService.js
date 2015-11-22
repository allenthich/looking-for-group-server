"use strict";

var TimeService = {
    prettify: function(uglyObject) {
        var newObject = JSON.parse(JSON.stringify(uglyObject));
        console.log(newObject)
        newObject['startTime'] = new Date(newObject.startTime);
        newObject['endTime'] = new Date(newObject.endTime);
        newObject['lockTime'] = new Date(newObject.lockTime);
        return newObject;
    }
};

module.exports = TimeService;