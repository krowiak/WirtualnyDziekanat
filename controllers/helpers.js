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