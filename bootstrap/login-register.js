function showRegisterForm(){
    $('.forgottenBox').fadeOut('fast',function(){})
    $('.loginBox').fadeOut('fast',function(){
        $('.registerBox').fadeIn('fast');
        $('.forgotten-footer').fadeOut('fast',function(){})
        $('.login-footer').fadeOut('fast',function(){
            $('.register-footer').fadeIn('fast');
        });
        $('.modal-title').html('Rejestracja');
    }); 
    $('.error').removeClass('alert alert-danger').html('');
       
}
function showLoginForm(){
    $('.forgottenBox').fadeOut('fast',function(){})
    $('#loginModal .registerBox').fadeOut('fast',function(){
        $('.loginBox').fadeIn('fast');
        $('.forgotten-footer').fadeOut('fast',function(){})
        $('.register-footer').fadeOut('fast',function(){
            $('.login-footer').fadeIn('fast');    
        });
        
        $('.modal-title').html('Logowanie');
    });       
     $('.error').removeClass('alert alert-danger').html(''); 
}
function showForgottenForm(){
    $('.loginBox').fadeOut('fast',function(){
        $('.forgottenBox').fadeIn('fast');
        $('.login-footer').fadeOut('fast',function(){  
            $('.forgotten-footer').fadeIn('fast');
        });
        
        $('.modal-title').html('Przypomnienie');
    });       
     $('.error').removeClass('alert alert-danger').html(''); 
}

function openLoginModal(){
    showLoginForm();
    setTimeout(function(){
        $('#loginModal').modal('show');    
    }, 230);
    
}
function openRegisterModal(){
    showRegisterForm();
    setTimeout(function(){
        $('#loginModal').modal('show');    
    }, 230);
    
}

function loginAjax(){
    /*   Remove this comments when moving to server
    $.post( "/login", function( data ) {
            if(data == 1){
                window.location.replace("/home");            
            } else {
                 shakeModal(); 
            }
        });
    */

/*   Simulate error message from the server   */
     shakeModal();
}

function shakeModal(){
    $('#loginModal .modal-dialog').addClass('shake');
             $('.error').addClass('alert alert-danger').html("Nieprawidłowe dane uzytkownika");
             $('input[type="password"]').val('');
             setTimeout( function(){ 
                $('#loginModal .modal-dialog').removeClass('shake'); 
    }, 1000 ); 
}

   