'use strict';

const statuses = [
    'oczekujacy',
    'rozpatrywany',
    'zaakceptowany',
    'odrzucony'
];

exports.Statuses = statuses;
exports.Oczekujacy = statuses[0];
exports.Rozpatrywany = statuses[1];
exports.Zaakceptowany = statuses[2];
exports.Odrzucony = statuses[3];
exports.getReadableStatus = function (status) {
    switch (status) {
        case exports.Oczekujacy:
            return 'Oczekujące na rozpatrzenie';
        case exports.Rozpatrywany:
            return 'Rozpatrywane';
        case exports.Zaakceptowany:
            return 'Zaakceptowane';
        case exports.Odrzucony:
            return 'Odrzucone';
        default:
            return 'Nieznany';
    }
};