text='';
Subjects=[];
var subjectToShow;
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
	subjectToShow=index;
	$("#asignedStudentsTable tbody").empty();
	$('#asignedStudentsTable tbody').attr('subjectId', Subjects[index].id);
	$("#subName").empty();
	$("#subName").append(Subjects[index].name);
	for(i=0;i<Subjects[index].users.length;i++){
			grades=[0,0];
			for(j=0;j<Subjects[index].users[i].grades.length;j++){
				grades[j] = Subjects[index].users[i].grades[j].grade;
			}		
			$('#asignedStudentsTable tbody').append( '<tr><td>'+ Subjects[index].users[i].id +'</td>' +'<td>' 
											    + Subjects[index].users[i].firstName+'</td>'+'<td>' 
											    + Subjects[index].users[i].lastName+'</td>'+'<td>'
											    +'<div class="input-group">'
											    +'<input id="fstAttempt" type="number" name="quantity" min="2" max="5" step="0.5" class="form-control" placeholder="'+grades[0]+'">'
											    +' <span class="input-group-btn">'
											    + '<button onClick="saveGrades('+Subjects[index].users[i].id+',1)" type="button" class="btn btn-success">Save'
											    +'</button></span></div></td><td>'

											    +'<div class="input-group">'
											    +'<input id="scndAttempt"type="number" name="quantity" min="2" max="5" step="0.5" class="form-control" placeholder="'+grades[1]+'">'
											    +' <span class="input-group-btn">'
											    + '<button onClick="saveGrades('+Subjects[index].users[i].id+',2)" type="button" class="btn btn-success">Save'+
											    '</button></span></div></td></tr>' );	
	}
	
}

function showMessage(msg){
	$('.alert').first().remove();
	$('.container').first().prepend('<div class="alert alert-info">'+msg+'</div>');
}


//funkcja na pałe na razie do poprawy!!
function saveGrades(id,att){
	var grade;
	if(att==1)
		grade=parseFloat($("#fstAttempt").val()).toFixed(2)
	else if(att==2)
		grade=parseFloat($("#scndAttempt").val()).toFixed(2)
	if(grade>=2 && grade<=5){
		jQuery.ajax({
		    url: "subjects/grade",
		    type:"POST",
		    dataType: "json",
		    data: { userId: id, subjectId: 1,grade: grade, attempt: att},
		    success: function(data) {
		    	if(data.message===undefined)
		    		showMessage("Zapisano ocenę");
		    	else
		    		showMessage(data.message);
		    	getSubjectInfo();     
		    },
		    error: function() {
		        //Do alert is error
		    }
		});
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
	    	if(subjectToShow)
	    		showSubject(subjectToShow);
	    },
	    error: function() {
	        //Do alert is error
	    }
	});
}
