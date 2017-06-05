/*global $*/
/*global showMessage*/

function changeFieldVisibility(selectedReason) {
    $("#subjectGroup").addClass("hidden");
    $("#untilGroup").addClass("hidden");
    $("#whyGroup").addClass("hidden");
    
    if (selectedReason === 'przedluzenie') {
        $("#untilGroup").removeClass("hidden");
    } else if (selectedReason === 'komis' || selectedReason === 'warunek') {
        $("#subjectGroup").removeClass("hidden");
    } else if (selectedReason === 'stypendium') {
        $("#whyGroup").removeClass("hidden");
    }
}

function sendForm() {
    const data = {
        reason: $("#reason option:selected").val(),
        subject: $("#subject").val(),
        until: $("#until").val(),
        why: $("#why option:selected").val(),
        body: $("#body").val(),
        userId: $("#userId").val()
    };
    
    $.ajax({
	    url: "/student/applications/new",
	    type: "POST",
	    dataType: "json",
	    data: data,
	    success: function(response) {		    	
	    	if(!response.message) {
	    	    window.location.href = '/student/applications';
	    	}
	    	else {
	    		showMessage(response);
	    	}   
	    },
	    error: function(err) {
	        console.log(err);
	        showMessage({ type: 'error', message: 'Nie udało się złożyć podania. Spróbuj ponownie później.' });
	    }
	});
	
	return false;
}

$(document).ready(function () {
    changeFieldVisibility($("#reason option:selected").val());  // Na wypadek cofnięcia się w historii itd.
    $('#reason').change(function () {
        var reason = $("#reason option:selected").val();
        changeFieldVisibility(reason);
    });
});