/*global $*/

function showMessage(msg){
	$('.alert').first().remove();
	$('.container').first().prepend('<div class="alert alert-info">'+msg+'</div>');
}

$(document).ready(function () {
    $('#saveCurr').click(function () {
        var year = $("#year").val();
        var term = $("#term").val();
        var data = { year: year, term: term };
        
		$.ajax({
		    url: "params/current",
		    type: "POST",
		    dataType: "json",
		    data: data,
		    success: function(response) {	    	
		    	if(response.message===undefined) {
		    		showMessage("Zapisano zmiany.");
		    	} else {
		    		showMessage(response.message);
		    	}  
		    },
		    error: function() {
		        //Do alert is error
		    }
		});
    });
});