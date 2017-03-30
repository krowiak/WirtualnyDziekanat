'use strict';

const winston = require('winston');
const logFilesPath = './logs/';

function configureDefaultLogger() {
    // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
    // Poziom 'info' === loguje error, warn i info
    const consoleLogLevel = 'debug';
    const fileLogLevel = 'verbose';

    winston.configure({
        transports: [
            new winston.transports.Console({
                level: consoleLogLevel,
                colorize: true,
                humanReadableUnhandledException: true
            }),
            new winston.transports.File({
                level: fileLogLevel,
                timestamp: true,
                filename: logFilesPath + 'log.log',
                maxsize: 5 * 1024 * 1024,  // rozmiar w bajtach
                maxFiles: 5,
                zippedArchive: true  // wszystkie logi poza ostatnim jako ZIP (bo moje webowe IDE nie daje mi dużo miejsca -_-)
            })
        ]
    });
    
    winston.exitOnError = false;
}

function createHttpRequestLogger() {
    const consoleLogLevel = 'info';
    const fileLogLevel = 'debug';
    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: consoleLogLevel,
                colorize: true,
                humanReadableUnhandledException: true,
                timestamp: true
            }),
            new winston.transports.File({
                level: fileLogLevel,
                timestamp: true,
                filename: logFilesPath + 'requests-log.log',
                maxsize: 5 * 1024 * 1024,  // rozmiar w bajtach
                maxFiles: 2,
                zippedArchive: true
            })
        ],
        exitOnError: false
    });
}

function createHttpRequestLoggingFunction(argument) {
    const loggingLevel = 'debug';
    const logger = createHttpRequestLogger();
    return message => logger.log(loggingLevel, message.trim());
}

exports.initialize = configureDefaultLogger;
exports.defaultLogger = winston;
exports.logHttpRequest = createHttpRequestLoggingFunction();
exports.logOrmStuff = winston.debug;