var DEBUG = true;

$(document).ready(function(){
    "use strict";

    var lr, tb;
    var min_width, min_height, max_width, max_height;
    var layout, container = $('#container'), side;
    var currentX = App.x, currentY = App.y; //Current X,Y of the window
    var currentW = App.width, currentH = App.height; //Current width/height of the window (including margin)
    var shiftW = 0, shiftH = 0; //Used for resizing
    var startX, startY, startW, startH; //Used every time a resize is started
    var observer, observer_conf = { subtree: true, childList: true, attributes: true, characterData: true };

    var parser = _.memoize(function(margins){
        return _.reduce(margins, function(memo, num){
            return memo + (parseInt(num, 10) === NaN ? 0 : parseInt(num, 10));
        }, 0);
    });
    function parse(sides){
        var margins = _.values(container.css(sides));
        return parser(margins);
    }
    function calc_margin(){
        lr = parse(['margin-left', 'margin-right']);
        tb = parse(['margin-top', 'margin-bottom']);
    }
    calc_margin();

    observer = new WebKitMutationObserver(function(mutations, observer){
        mutations.forEach(function(mutation){
            if(mutation.target.id == container.attr("id") && mutation.type == "attributes"){
                calc_margin();
                App.resize(currentX, currentY, currentW + lr, currentH + tb);
            }
        });
    });

    observer.start = function(){
        observer.observe(document, observer_conf);
    };

    observer.stop = function(){
        observer.disconnect();
    };

    observer.start();

    layout = container.layout({
        applyDemoStyles: true,
        resizeWithWindowMaxDelay: 1
    });

    container.resizable({
        handles: 'n, e, s, w, ne, se, sw, nw', // 'all'
        minWidth: 300,
        minHeight: 300,
        maxWidth: 1250,
        maxHeight: 700,

        start: function(e, ui){
            observer.stop();

            //      /*******N*******\
            //      *NW           NE*
            //      *               *
            //      W               E
            //      *               *
            //      *SW           SE*
            //      \*******S*******/

            var handleClass = $(e.originalEvent.target).attr("class");
            side = handleClass.match(/(?:^| )ui-resizable-(.{1,2})(?: |$)/)[1];

            startX = e.screenX - e.pageX;
            startY = e.screenY - e.pageY;

            startW = ui.size.width;
            startH = ui.size.height;

            min_width = container.resizable("option", "minWidth");
            min_height = container.resizable("option", "minHeight");
            max_width = container.resizable("option", "maxWidth");
            max_height = container.resizable("option", "maxHeight");
        },

        resize: function(e, ui){

            currentX = e.screenX - e.clientX;
            currentY = e.screenY - e.clientY;

            currentW = ui.size.width;
            currentH = ui.size.height;

            var diffW = ui.originalSize.width - currentW;
            var diffH = ui.originalSize.height - currentH;

            switch(side){
                case "e":
                case "se":
                case "s":
                    currentW = currentW + lr;

                    currentH = currentH + tb;

                    break;

                case "sw":
                    currentH = currentH + tb;

                    if(!_.isNull(min_width) && shiftW + currentW + lr <= min_width){
                        currentW = min_width;
                    }else if(!_.isNull(max_width) && shiftW + currentW + lr >= max_width){
                        currentW = max_width;
                    }else{
                        currentX += diffW;
                        shiftW -= diffW;
                        currentW = ui.originalSize.width + lr + shiftW;
                    }

                    break;

                case "w":

                    if(!_.isNull(min_width) && shiftW + currentW + lr <= min_width){
                        currentW = min_width;
                    }else if(!_.isNull(max_width) && shiftW + currentW + lr >= max_width){
                        currentW = max_width;
                    }else{
                        currentX += diffW;
                        shiftW -= diffW;
                        currentW = ui.originalSize.width + lr + shiftW;
                    }

                    break;

                case "nw":

                    if(!_.isNull(min_width) && shiftW + currentW + lr <= min_width){
                        currentW = min_width;
                    }else if(!_.isNull(max_width) && shiftW + currentW + lr >= max_width){
                        currentW = max_width;
                    }else{
                        currentX += diffW;
                        shiftW -= diffW;
                        currentW = ui.originalSize.width + lr + shiftW;
                    }

                    if(!_.isNull(min_height) && shiftH + currentH + tb <= min_height){
                        currentH = min_height;
                    }else if(!_.isNull(max_height) && shiftH + currentH + tb >= max_height){
                        currentH = max_height;
                    }else{
                        currentY += diffH;
                        shiftH -= diffH;
                        currentH = ui.originalSize.height + tb + shiftH;
                    }

                    break;

                case "n":

                    if(!_.isNull(min_height) && shiftH + currentH + tb <= min_height){
                        currentH = min_height;
                    }else if(!_.isNull(max_height) && shiftH + currentH + tb >= max_height){
                        currentH = max_height;
                    }else{
                        currentY += diffH;
                        shiftH -= diffH;
                        currentH = ui.originalSize.height + tb + shiftH;
                    }

                    break;

                case "ne":
                    currentW = currentW + lr;

                    if(!_.isNull(min_height) && shiftH + currentH + tb <= min_height){
                        currentH = min_height;
                    }else if(!_.isNull(max_height) && shiftH + currentH + tb >= max_height){
                        currentH = max_height;
                    }else{
                        currentY += diffH;
                        shiftH -= diffH;
                        currentH = ui.originalSize.height + tb + shiftH;
                    }

                    break;
            }

            App.resize(currentX, currentY, currentW, currentH);

            container.width(currentW - lr);
            container.height(currentH - tb);

            container.css("left", "0px");
            container.css("top", "0px");

            e.preventDefault();

            //TODO: dispatch only if changed
            EventBus.dispatch("window_resize", e, ui);

        },

        stop: function(e, ui){
            e.preventDefault();

            //TODO: dispatch only if changed
            EventBus.dispatch("window_resized", e, ui);

            shiftW = shiftH = 0;
            observer.start();
        }
    });

    $("#minimize").on("mouseup", function(e){
        e.preventDefault();
        App.minimize();
	});

    $("#maximize").on("mouseup", function(e){
        e.preventDefault();
        App.maximize();
	});

    $("#quit").on("mouseup", function(e){
        e.preventDefault();
        App.quit();
    });

    $("#bar").mousedown(function(e){
        e.preventDefault();

        if(this !== e.target){
            return;
        }

        startX = e.screenX - e.pageX;
        startY = e.screenY - e.pageY;

        App.mousePressEvent(e.pageX, e.pageY);

        var f_mousemove = function(e){
            e.preventDefault();

            //TODO: dispatch only if changed
            EventBus.dispatch("window_drag", e);

            //TODO: dispatch only if changed
            EventBus.dispatch("window_move", e);

            currentX = e.screenX - e.pageX;
            currentY = e.screenY - e.pageY;
            App.mouseMoveEvent(e.screenX, e.screenY);
        };

        $(document).on("mousemove", f_mousemove);

        $(document).one("mouseup", function(e){
            e.preventDefault();

            //TODO: dispatch only if changed
            EventBus.dispatch("window_moved", e);

            $(document).off("mousemove", f_mousemove);
        });

        $("#bar").one("ondragstart", function(e){
            e.preventDefault();
            return false;
        });
    });

    function debug_window_resize(e, ui){
        e = e.target;
        //console.log("Size change from %s:%s to %s:%s", ui.originalSize.width + lr, ui.originalSize.height + tb, currentW, currentH);
    }

    function debug_window_resized(e, ui){
        console.log("Size changed from %s:%s to %s:%s", startW, startH, currentW, currentH);
    }

    function debug_window_drag(e){
        e = e.target;
        var oldMouseX = e.screenX - (e.screenX - e.pageX - currentX);
        var oldMouseY = e.screenY - (e.screenX - e.pageX - currentY);
        //console.log("Mouse drag from %s:%s to %s:%s", oldMouseX, oldMouseY, e.screenX, e.screenY);
    }

    function debug_window_move(e){
        e = e.target;
        var newX = e.screenX - e.pageX;
        var newY = e.screenY - e.pageY;
        //console.log("Window position change from %s:%s to %s:%s", currentX, currentY, newX, newY);
    }

    function debug_window_moved(e){
        console.log("Window position changed from %s:%s to %s:%s", startX, startY, currentX, currentY);
    }

    if(DEBUG){
        EventBus.addEventListener("window_resize", debug_window_resize);
        EventBus.addEventListener("window_resized", debug_window_resized);

        EventBus.addEventListener("window_drag", debug_window_drag);

        EventBus.addEventListener("window_move", debug_window_move);
        EventBus.addEventListener("window_moved", debug_window_moved);
    }

});
