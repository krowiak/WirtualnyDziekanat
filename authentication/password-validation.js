'use strict';
const s = require("sprintf-js");

function validateLength(password) {
    const min = 6,
        max = 50;
        
    if (!password) {
        return { success: false, message: 'Hasło nie może być puste' };
    }
    
    if (password.length < min) {
        return { 
            success: false,
            message: s.sprintf('Hasło nie może być krótsze niż %i znaków.', min)
        };
    }
    
    if (password.length > max) {
        return { 
            success: false,
            message: s.sprintf('Hasło nie może być dłuższe niż %i znaków.', max)
        };
    }
    
    return { success: true };
}

function validateNoWhitespace(password) {
    const noWhitespace = password.replace(/\s/g,'');
    
    if (password === noWhitespace) {
        return { success: true };
    } else {
        return { 
            success: false, 
            message: 'Hasło nie może zawierać pustych znaków (takich jak spacje).'
        };
    }
}

exports.validatePassword = function(password) {
    const validLength = validateLength(password);
    if (validLength.success) {
        return validateNoWhitespace(password);
    } else {
        return validLength;
    }
};