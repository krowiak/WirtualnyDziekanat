const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');

exports.create = function (applicationData, pipeTo) {
    const fontBold = path.resolve(__dirname, './fonts/Merriweather/Merriweather-Bold.ttf');
    const fontRegular = path.resolve(__dirname, './fonts/Merriweather/Merriweather-Regular.ttf');
    const fontSignature = path.resolve(__dirname, './fonts/Merriweather/Merriweather-Italic.ttf');
    const doc = new PDFDocument();
    const stream = doc.pipe(pipeTo);
    const createdAt = moment(applicationData.created_at).format('DD.MM.YYYY');
    const body = JSON.parse(applicationData.body);
    
    doc.font(fontRegular, 12)
       .text(createdAt, {align: 'right'});
    doc.moveDown(2);
    
    doc.font(fontBold, 25)
       .text('Podanie o warunkowe zaliczenie etapu studiów', 
       {align: 'center'});
    doc.moveDown(1);
    
    doc.font(fontRegular, 13)
       .text('Niezaliczony przedmiot: ' + body.subject);
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