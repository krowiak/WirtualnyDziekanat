text='';
Users={};
$(document).ready(function () {
	getUsers('');	
  	$('#searchbtn').click(function () {
	  	text = $('#searchText').val(); 
	  	getUsers(text);
  	});

  	$('#sendButton').click(function () {
	  	send();
  	});
  
});

function getUsers(text){
	jQuery.ajax({
	    url: "/users",
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

function createTable(users){
	$("#userTable tbody").empty();
	for(i=0;i<users.length;i++){
			    $('#userTable tbody').append( '<tr><td>'+ users[i].id +'</td>' +'<td>' 
											    	+ users[i].firstName+'</td>'+'<td>' 
											    	+ users[i].lastName+'</td>'+'<td>'
											    	+'<button onClick="openModal('+i+')" type="button", data-toggle="modal", data-target="#notmyModal" class="btn btn-info">Send</button></td></tr>' );
	}
}

function openModal(index){
	if(Users[index]){
		$("#notmyModal .modal-title").text("Send to: "+ Users[index].firstName + " " + Users[index].lastName);
		$('#notmyModal').attr('userId', Users[index].id);

	}
}

function send(){
	toId= $('#notmyModal').attr('userId');
	content = $('#comment').val();
	if(content.length>0 && content.length<1000){
		jQuery.ajax({
			    url: "message/send",
			    type:"POST",
			    dataType: "json",
			    data: { fromId: 1, toId: toId,content: content},
			    success: function(data) {   
			    	 $('#notmyModal').modal('toggle');
			    },
			    error: function() {
			        //Do alert is error
			    }
			});
	}
	else{
		alert("I won't send that!");
	}
}