/*global $*/

function showMessage(message) {
    $('#alerts').empty();
    
    var alertType;
    switch (message.type) {
        case 'success':
            alertType = 'alert-success'
            break;
        case 'info':
            alertType = 'alert-info'
            break;
        case 'warning':
            alertType = 'alert-warning'
            break;
        case 'error':
        default:
            alertType = 'alert-danger'
            break;
    }
    
    $('<div class="alert alert-dismissable ' + alertType 
        + '">' + message.message 
        + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a></div>')
    .appendTo('#alerts');
}