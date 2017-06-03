text='';
Subjects=[];
$(document).ready(function () {
	getSubjectInfo();
  	$('#searchbtn').click(function () {
	  	text = $('#searchText').val(); 
	  	getSubjectInfo();
  	});
});

function createTable(subjects){
	$("#subjectTable tbody").empty();
	for(i=0;i<subjects.length;i++){
			    $('#subjectTable tbody').append( '<tr><td>'
											    	+ subjects[i].name+'</td>'+'<td>' 
											    	+ subjects[i].year+'</td>'+'<td>'
											    	+ subjects[i].term+'</td>'+'<td>'
											    	+ '<button onClick="showSubject('+i+')" type="button" class="btn btn-success">Show'+
											    	'</button></td></tr>' );
	}
}

function showSubject(index){
	$("#asignedStudentsTable tbody").empty();
	$("#subName").empty();
	$("#subName").append(Subjects[index].name);
	for(i=0;i<Subjects[index].users.length;i++){		
			$('#asignedStudentsTable tbody').append( '<tr><td>'+ Subjects[index].users[i].id +'</td>' +'<td>' 
											    + Subjects[index].users[i].firstName+'</td>'+'<td>' 
											    + Subjects[index].users[i].lastName+'</td>'+'<td>'
											    +'</td></tr>');	
	}
}

function getSubjectInfo(){
	jQuery.ajax({
	    url: "subjects/mySubjects",
	    type:"GET",
	    dataType: "json",
	    data: { where: {name: {like: '%'+text+'%'}}},
	    success: function(data) {
	    	Subjects=data;  
	    	createTable(data);      
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}
