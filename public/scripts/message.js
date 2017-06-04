text='';
Users={};
Messages={};
$(document).ready(function () {
	getUsers('');
	getMessages();	
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

function getMessages(text){
	jQuery.ajax({
	    url: "message/1",
	    type:"GET",
	    dataType: "json",
	    success: function(data) {
	    	Messages=data;
	        createMsgTable(data);	        
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}

function createMsgTable(messages){
	$("#allMessages tbody").empty();
	for(i=0;i<messages.length;i++){
				date = messages[i].created_at;
			    $('#allMessages tbody').append( '<tr><td>'+ messages[i].from +'</td>' +'<td>' 
											    	+date+'</td>'+'<td>' 
											    	+'<button onClick="openMsgModal('+i+')" type="button", data-toggle="modal", data-target="#myModal" class="btn btn-info">Check it out</button></td></tr>' );
	}
}


function createTable(users){
	$("#userTable tbody").empty();
	for(i=0;i<users.length;i++){
			    $('#userTable tbody').append( '<tr><td>'+ users[i].firstName +'</td>' +'<td>' 
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
function openMsgModal(index){
	if(Messages[index]){
		$("#myModal .modal-title").text("Message From: "+ Messages[index].from);
		$('#myModal').attr('userId', Messages[index].id);
		$('#myModal .modal-body p').text(Messages[index].content);


		//ustawienie przezornie juz drugiego modalka
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