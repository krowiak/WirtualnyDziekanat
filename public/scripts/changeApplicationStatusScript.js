/*global $*/
/* global showMessage*/

$(document).ready(function () {
    $('#changeStatusBtn').click(function () {
        var newStatus = $("#statusChanger option:selected").val();
        var applicationId = $("#statusChanger").data('id');
        $.ajax({
		    url: "/admin/applications/changeStatus",
		    type: "POST",
		    dataType: "json",
		    data: { applicationId: applicationId, newStatus: newStatus },
		    success: function(response) {		    	
		    	if(!response.message) {
		    		showMessage({ type: 'info', message: 'Status podania został zmieniony.' });
		    	}
		    	else {
		    		showMessage(response);
		    	}   
		    },
		    error: function(err) {
		        console.log(err);
		        showMessage({ type: 'error', message: 'Nie udało się zmienić statusu. Spróbuj ponownie później.' });
		    }
		});
    });
});