Users={};
Asigned=[];
text='';
$(document).ready(function () {
	getUsers('');	
	getSubjectInfo();
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
	$("#asignedStudentsTable tbody").empty();
	for(i=0;i<users.length;i++){		
		if(users[i].role==2){
			$('#asignedTeachersTable tbody').append( '<tr><td>'+ users[i].id +'</td>' +'<td>' 
											    + users[i].firstName+'</td>'+'<td>' 
											    + users[i].lastName+'</td>'+'<td>'
											    + '<button onClick="removeFromSubject('+i+')" type="button" class="btn btn-danger">Remove'+
											    '</button></td></tr>' );
		}
		else if(users[i].role==3){
			$('#asignedStudentsTable tbody').append( '<tr><td>'+ users[i].id +'</td>' +'<td>' 
											    + users[i].firstName+'</td>'+'<td>' 
											    + users[i].lastName+'</td>'+'<td>'
											    + '<button onClick="removeFromSubject('+i+')" type="button" class="btn btn-danger">Remove'+
											    '</button></td></tr>' );	
		}
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
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}

function showMessage(msg){
	$('.alert').first().remove();
	$('.container').first().prepend('<div class="alert alert-info">'+msg+'</div>');
}

function asignToSubject(index){
	$.ajax({
	  	type: "POST",
	  	url: "assign-users",
	  	data: {users: [Users[index].id], subjectId: $( "h1" ).attr("data-internalid")},
	  	success: function(data) { 
	  		showMessage(data.message);  
	  		getSubjectInfo();  
	    },
	});
}

function removeFromSubject(index){
	$.ajax({
	  	type: "POST",
	  	url: "remove-users",
	  	data: {users: [Asigned[index].id], subjectId: $( "h1" ).attr("data-internalid")},
	  	success: function(data) { 
	  		showMessage(data.message);    
	  		getSubjectInfo();
	    },
	});
}

function getSubjectInfo(){
	jQuery.ajax({
	    url: "users/"+ $( "h1" ).attr("data-internalid"),
	    type:"GET",
	    dataType: "json",
	    success: function(data) {;
	    	Asigned=data;
	        recreateAsignedTable(data);	        
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}