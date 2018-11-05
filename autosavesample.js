example.autosave = (function () {

    var _moduleName = "autosave";
    var _elementSaves = {};
    var _timer;
    var _busy;
    var _blocking;
    var _saveQueue = [];


    /*
    Small clip of the autosave function I wrote for a application we use using RESTful API
    we wanted to incorperate a Google docs like autosaving ability to our applications. Without adopting or changing our stack
    We currently don't use any modern frameworks and use grails/oracle as a backend so this was something I had come up with as a intern.
    
    Each element has a onBlur event that is linked to a generic function to send a AJAX for a save. The onBlur would trigger once a user 
    "tabs or clicks out of a field". Then the ajax will send a POST request. We had the issue of a user quickly filling a long form and the saves
    would be out of order, this autosave event handler would fix that problem. 
    */
    function processQueue(funct) {
        example.log(_moduleName + ".processQueue", "starting save " + JSON.stringify(funct));
        return new RSVP.Promise(function (resolve, reject) {
            /*
            we pass the literal function with its parameters
            */
            funct[0](funct[1], funct[2], funct[3]).then(function () {
                var name = $("[for='" + funct[1] + "']").text();
                if(name == "Please specify other country here:")
                {
                    name = "specify(other)";
                }
                $.notify("Autosave " + name + " succeeded", "success");
                example.log(_moduleName + ".processQueue", "save resolved starting next save");
                setTimeout(function () {
                    queue(2);
                    if (_saveQueue.length <= 0) {
                        $(".disableWhenQueue").removeAttr("disabled");
                        $(".enableWhenQueue").hide();
                    }
                }, 5);
                resolve();
            }).catch(function (reason) {
                reason = JSON.stringify(reason);
                if (reason.indexOf("403") >= 0) {
                    $.notify("Autosave" + name + " failed: Unclaimed / Forbidden", "error");
                } else {
                    $.notify("Autosave" + name + " failed", "error");
                }
                example.log(_moduleName + ".processQueue", "save failed trying next " + reason);
                setTimeout(function () { queue(2); }, 5);
                setTimeout(function () {
                    queue(2);
                    if (_saveQueue.length <= 0) {
                        $(".disableWhenQueue").removeAttr("disabled");
                    }
                }, 5);
                reject(reason);
            });
        }).catch(function (reason) { throw reason; });
    }

    function queue(cmd, a) {
        $(".disableWhenQueue").attr("disabled", "true");
        $(".enableWhenQueue").show();
        var funct;
        if (cmd == 1) {
            if (!_blocking) {
                example.log(_moduleName + ".Queue", "cmd 1 pushed");
                _saveQueue.push(a);
            }
            else {
                example.log(_moduleName + ".Queue", "queue is blocked until save is complete.");
            }
            if (!_busy) {
                _busy = true;
                funct = _saveQueue.shift();
                example.log(_moduleName + ".Queue", "cmd 1 calling process");
                processQueue(funct);
            }
        } else if (cmd == 2) {
            if (_saveQueue.length > 0) {
                example.log(_moduleName + ".Queue", "cmd 2 starting next.");
                funct = _saveQueue.shift();
                processQueue(funct);
            } else {
                _blocking = false
                example.log(_moduleName + ".Queue", "cmd 2 queue is empty.");
                _busy = false;
            }
        }
    }

    /*
    Used to add functions to the event queue
    */
    function addToQueue(funct, isSave) {
        return new RSVP.Promise(function (resolve, reject) {
            example.log("adding this to the queue:", JSON.stringify(funct));
            queue(1, funct);
            if (isSave) {
                _blocking = true
            }
            resolve();
        }).catch(function (reason) { throw reason; });
    }

    return {
        addToQueue: addToQueue,
    };
})();