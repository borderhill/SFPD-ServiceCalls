import pino, { destination } from 'pino';
//import pinohttp from 'pino-http';

const transport = pino.transport({
    targets: [
        // FILE logging commented 
        // {
        //     // level: process.env.PINO_LOG_LEVEL_FILE || 'trace',
        //     level: 'trace',
        //     target: 'pino-pretty',
        //     options: {destination: './logs/server.log', mkdir: true, colorize: false}
        // },
        {
            level: 'trace',
            target: 'pino-pretty',
            options: {destination: process.stdout.fd}
        }       
    ]
});

// export const pinologger =  pinohttp({
//    level: 'trace',
//    logger: pino({ level: 'trace',}, transport),
// })

// export const logger = pinologger.logger;

const logger = pino(
    { level: 'trace',},
    transport);

export default logger;

