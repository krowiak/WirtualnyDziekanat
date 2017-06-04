const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');
const scholarshipReasons = require('../models/scholarship-reasons');

function getReadableScholarshipReason(reason) {
    switch (reason) {
        case scholarshipReasons.Learning:
            return 'za osiagnięcia w nauce';
        case scholarshipReasons.Sports:
            return 'za osiagnięcia sportowe';
        case scholarshipReasons.Social:
            return 'socjalnego';
        case scholarshipReasons.Other:
            return '';
        default:
            return 'nieokreślonego rodzaju';
    }
}

exports.create = function (applicationData, pipeTo) {
    const fontTitle = path.resolve(__dirname, './fonts/Merriweather/Merriweather-Bold.ttf');
    const fontRegular = path.resolve(__dirname, './fonts/Merriweather/Merriweather-Regular.ttf');
    const fontSignature = path.resolve(__dirname, './fonts/Merriweather/Merriweather-Italic.ttf');
    const doc = new PDFDocument();
    const stream = doc.pipe(pipeTo);
    const createdAt = moment(applicationData.created_at).format('DD.MM.YYYY');
    const body = JSON.parse(applicationData.body);
    
    doc.font(fontRegular, 12)
       .text(createdAt, {align: 'right'});
    doc.moveDown(2);
    
    doc.font(fontTitle, 25)
       .text('Podanie o przyznanie stypendium ' + getReadableScholarshipReason(body.why), 
       {align: 'center'});
    doc.moveDown(1);
       
    doc.font(fontRegular, 13)
       .text(body.body, {
         align: 'justify',
       });
    doc.moveDown(1);
       
    doc.font(fontSignature)
        .text(applicationData.user.firstName + ' ' + applicationData.user.lastName, {
            align: 'right'
        });
       
    doc.end();
    return stream;
}