Users={};
text='';
$(document).ready(function () {
	alert($( "h1" ).attr("data-internalid"));
	getUsers('');	
  	$('#searchbtn').click(function () {
	  	text = $('#searchText').val(); 
	  	getUsers(text);
  	});
  
});

function createTable(users){
	$("#userTable tbody").empty();
	for(i=0;i<users.length;i++){
			    $('#userTable tbody').append( '<tr><td>'+ users[i].id +'</td>' +'<td>' 
											    	+ users[i].firstName+'</td>'+'<td>' 
											    	+ users[i].lastName+'</td>'+'<td>'
											    	+ '<button onClick="asignToSubject('+i+')" type="button" class="btn btn-success">Asign'+
											    	'</button></td></tr>' );
	}
}

function recreateAsignedTable(users){
	$("#asignedTeachersTable tbody").empty();
	for(i=0;i<users.length;i++){
			    $('#asignedTeachersTable tbody').append( '<tr><td>'+ users[i].id +'</td>' +'<td>' 
											    	+ users[i].firstName+'</td>'+'<td>' 
											    	+ users[i].lastName+'</td>'+'<td>'
											    	+ '<button onClick="removeFromSubject('+i+')" type="button" class="btn btn-danger">Remove'+
											    	'</button></td></tr>' );
	}
}

function forcePasswordChange(index){
	$.ajax({
	  	type: "POST",
	  	url: "list/changeUsers",
	  	data: {changes: [{id:  + Users[index].id, forcePasswordChange: !Users[index].forcePasswordChange }]},
	  	success: function(data) {   
	  		getUsers(text);  
	    },
	});
}

function getUsers(text){
	jQuery.ajax({
	    url: "/admin/list/backend",
	    type:"GET",
	    data: { where: {$or: [{firstName: {like: '%'+text+'%'}},{lastName: {like: '%'+text+'%'}}]}},
	    dataType: "json",
	    success: function(data) {
	    	Users=data;
	        createTable(data);
	        recreateAsignedTable(data);	        
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}

function asignToSubject(index){

}

function removeFromSubject(index){

}

function getSubjectInfo(){

}