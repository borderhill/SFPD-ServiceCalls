import express from 'express';
import logger from './logger.js';
import router from './routes/serviceCallsRoute.js';
import pino from 'pino';
import pinoHttp from 'pino-http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse form-encoded data
// app.use(express.static('public')); // serve static files

export const responseBodyHookMiddleware = (req, res, next) => {
    const originalJson = res.json;
    const originalSend = res.send;

    if (!res.locals) {
        res.locals = {};
    }

    res.json = function (data) {
        res.locals.responseBody = structuredClone(data);
        return originalJson.call(this, data);
    };

    res.send = function (data) {
        if (typeof data === 'object' && data !== null) {
            res.locals.responseBody = structuredClone(data);
        } else {
            res.locals.responseBody = data;
        }
        return originalSend.call(this, data);
    };

    next();
};

app.use(responseBodyHookMiddleware);
app.use(pinoHttp({
    logger,
    serializers: {
        req(req) {
            return {
                ...pino.stdSerializers.req(req),
                body: req.raw.body || null,
            };
        },
        res(res) {
            return {
                ...pino.stdSerializers.res(res.raw),
                body: JSON.parse(res.raw.locals.responseBody || '{}'),
            };
        },
    }
}));

const port = 8080

app.use("/", router);

app.listen(port, () => {
    logger.info('NodeJS version' + process.versions.node);
    logger.info(`Example app listening on port ${port}`)
})

