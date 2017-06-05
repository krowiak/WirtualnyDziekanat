'use strict';

const reasons = [
    'stypendium',
    'warunek',
    'przedluzenie',
    'komis'
];

exports.Reasons = reasons;
exports.Stypendium = reasons[0];
exports.Warunek = reasons[1];
exports.Przedluzenie = reasons[2];
exports.EgzaminKomisyjny = reasons[3];
exports.getReadableReason = function (reason) {
    switch (reason) {
        case exports.Stypendium:
            return 'Stypendium';
        case exports.Warunek:
            return 'Warunkowe zaliczenie etapu';
        case exports.Przedluzenie:
            return 'Przedłużenie sesji egzaminacyjnej';
        case exports.EgzaminKomisyjny:
            return 'Egzamin komisyjny';
        default:
            return 'Nieznany';
    }
};