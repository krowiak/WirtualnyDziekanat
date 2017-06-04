'use strict';

const express = require('express');
const router = express.Router();
const applications = require('../models/application');
const applicationReasons = require('../models/application-reasons');
const applicationStatuses = require('../models/application-statuses');
const scholarshipReasons = require('../models/scholarship-reasons');
const logger = require('winston');
const moment = require('moment');

function getAcceptedScholarships(userId) {
    return applications.Application.findAll({
        where: { 
            userId: userId,
            reason: applicationReasons.Stypendium,
            status: applicationStatuses.Zaakceptowany
        },
        attributes: applications.publicFields,
        order: [['created_at', 'DESC']]
    });
}

function makeScholarshipDataObject(application) {
    logger.info(application.toJSON());
    const body = JSON.parse(application.body);
    return {
        applicationId: application.id,
        reason: scholarshipReasons.getReadableReason(body.why),
        when: moment(application.updated_at).format('DD.MM.YYYY')
    };
}

router.get('/', function(req, res, next) {
    getAcceptedScholarships(req.user.id)
        .then((scholarships) => {
            const viewData = req.viewData;
            viewData.scholarships = scholarships.map(makeScholarshipDataObject);
            res.render('scholarships', viewData);
        });
});

module.exports = router;