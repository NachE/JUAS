$(document).ready(function(){

    //Some global vars
    var app_company = "my_app_company";
    var app_name = "my_app";
    var app_title = "My App";

    //We'll find those two vars useful
    var container = $('#container');
    var layout = container.data("layout");

    //App let's us access the C++ side of the application
    App.createTrayIcon("html/img/trayicon.png");

    //Set the title
    App.setTitle(app_title);

    //Set mix/max size limits
    container.resizable("option", "minWidth", 300);
    container.resizable("option", "minHeight", 300);
    container.resizable("option", "maxWidth", 2000);
    container.resizable("option", "maxHeight", 1000);

    //Resize the window and center
    if(App.isWindowGeometrySaveAvailable(app_company, app_name)){
        App.restoreWindowGeometry(app_company, app_name);
    }else{
        availableGeometry = App.availableGeometry();
        var available_x = availableGeometry[0];
        var available_y = availableGeometry[1]
        var available_width = availableGeometry[2];
        var available_height = availableGeometry[3];

        var width = available_width * 0.7; //70% width
        var height = available_height * 0.7; //70% height;
        var x = available_x + ((available_width - width) / 2);
        var y = available_y + ((available_height - height) / 2);

        App.resize(x, y, width, height);
    }

    //Show the main window
    App.show();

    //We can save the window geometry state after each resize/position change
    function save_geometry(){
        App.saveWindowGeometry(app_company, app_name);
    }
    EventBus.addEventListener("window_drag", save_geometry);
    EventBus.addEventListener("window_resize_stop", save_geometry);

    //We can stop/handle a quit event
    function before_quit(){
        console.log("Gone fishing!");
        App.quit();
    }
    EventBus.addEventListener("app_quit", before_quit);

    //We can also clear the window geometry state if we want to do so
    //App.clearSavedWindowGeometry(app_company, app_name);


});
