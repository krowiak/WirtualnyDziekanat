Users={};
text='';
$(document).ready(function () {
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
											    	+ '<button onClick="blockUser('+i+')" type="button" class="btn btn-warning">'+(users[i].locked?'Unlock':'Block')+
											    	'</button></td><td>'+ 
											    	'<button onClick="forcePasswordChange('+i+')" type="button" class="btn btn-danger">'+(users[i].forcePasswordChange?'Nevermind':'Force password change')+
											    	'</button></td></tr>' );
	}
}

function blockUser(index){
	$.ajax({
	  	type: "POST",
	  	url: "list/changeUsers",
	  	data: {changes: [{id:  + Users[index].id, locked: !Users[index].locked }]},
	  	success: function(data) {   
	  		getUsers(text);  
	    },
	});
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

function asignToSubject(index){

}

function removeFromSubject(index){

}

function getSubjectInfo(){

}