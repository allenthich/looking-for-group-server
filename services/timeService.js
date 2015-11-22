"use strict";

var TimeService = {
    prettify: function(uglyObject) {
        var newObject = JSON.parse(JSON.stringify(uglyObject));
        newObject['startTime'] = new Date(newObject.startTime);
        newObject['endTime'] = new Date(newObject.endTime);
        newObject['lockTime'] = new Date(newObject.lockTime);
        console.log(newObject);
        return newObject;
    }
};

module.exports = TimeService;