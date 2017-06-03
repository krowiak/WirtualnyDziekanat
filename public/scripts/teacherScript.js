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
											    +'<input id="fstAttempt" type="number" name="quantity" min="0" max="5" step="0.5" class="form-control" placeholder="'+/*Subjects[index].users[i].grades[0].grade+*/'">'+'</td><td>'
											    +'<input id="scndAttempt"type="number" name="quantity" min="0" max="5" step="0.5" class="form-control" placeholder="">'+'</td><td>'
											    + '<button onClick="saveGrades('+i+')" type="button" class="btn btn-success">Save'+
											    '</button></td></tr>' );	
	}
}

function showMessage(msg){
	$('.alert').first().remove();
	$('.container').first().prepend('<div class="alert alert-info">'+msg+'</div>');
}


//funkcja na pałe na razie do poprawy!!
function saveGrades(index){
	jQuery.ajax({
	    url: "subjects/grade",
	    type:"POST",
	    dataType: "json",
	    data: { userId: Subjects[0].users[index].id, subjectId: 1,grade: parseFloat($("#fstAttempt").val()).toFixed(2), attempt: 2},
	    success: function(data) {
	    	showMessage(data.message);     
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}

function getSubjectInfo(){
	jQuery.ajax({
	    url: "subjects/mySubjects",
	    type:"GET",
	    dataType: "json",
	    data: { where: {name: {like: '%'+text+'%'}}},
	    success: function(data) {
	    	alert(JSON.stringify(data))
	    	Subjects=data;  
	    	createTable(data);      
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}
