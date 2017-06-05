/*global $*/
/*global showMessage*/
            
function sendForm() {
    const data = {
        name: $("#name").val(),
        year: $("#year").val(),
        term: $("#terms option:selected").val()
    };
    
    $.ajax({
	    url: "/admin/subjects/add-subject",
	    type: "POST",
	    dataType: "json",
	    data: data,
	    success: function(response) {  	    	
	    	if(response.type === 'success') {
	    	    window.location.reload();
	    	} 
    		showMessage(response);
	    },
	    error: function(err) {
	        console.log(err);
	        showMessage({ type: 'error', message: 'Nie udało się dodać przedmiotu. Spróbuj ponownie później.' });
	    }
	});
	
	return false;
}

function deleteSubject(id) {
    $.ajax({
	    url: "subjects/delete-subject",
	    type: "POST",
	    dataType: "json",
	    data: {id: id},
	    success: function(response) {		    	
	    	if(response.type === 'success') {
	    	    $('#'+id).remove();
	    	} 
    		showMessage(response);
	    },
	    error: function(err) {
	        console.log(err);
	        showMessage({ type: 'error', message: 'Nie udało się usunąć przedmiotu. Spróbuj ponownie później.' });
	    }
	});
}