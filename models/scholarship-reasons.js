'use strict';

const reasons = [
    'brain',
    'brawn',
    'social',
    'no-reason'
];

exports.Reasons = reasons;
exports.Learning = reasons[0];
exports.Sports = reasons[1];
exports.Social = reasons[2];
exports.Other = reasons[3];

exports.getReadableReason = function(reason) {
    switch (reason) {
        case exports.Learning:
            return 'Za osiagnięcia w nauce';
        case exports.Sports:
            return 'Za osiagnięcia sportowe';
        case exports.Social:
            return 'Stypendium socjalne';
        case exports.Other:
            return 'Inny';
        default:
            return '(brak)';
    }
}