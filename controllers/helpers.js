function createFlashData(req) {
    const successes = req.flash('success'),
        infos = req.flash('info'),
        warnings = req.flash('warning'),
        errors = req.flash('error');
    const anyAlerts = successes.length > 0 || 
        infos.length > 0 || 
        warnings.length > 0 || 
        errors.length > 0;
    return {
        successes: successes,
        infos: infos,
        warnings: warnings,
        errors: errors,
        anyAlerts: anyAlerts
    };
}

exports.createCommonViewData = function (req) {
    return {user: req.user, flash:createFlashData(req)};
};

exports.renderMessage = function (req, res, message) {
    const alerts = req.viewData.flash;
    switch (message.type) {
        case 'success':
            alerts.successes.push(message.message);
            break;
        case 'infos':
            alerts.infos.push(message.message);
            break;
        case 'warnings':
            alerts.warnings.push(message.message);
            break;
        case 'errors':
        default:
            alerts.errors.push(message.message);
            break;
    }
    alerts.anyAlerts = true;
    res.render('layout', req.viewData);
};