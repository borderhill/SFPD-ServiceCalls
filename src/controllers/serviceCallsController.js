import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { DatabaseError, Pool } from 'pg';
import { UNIQUE_VIOLATION } from 'pg-error-constants';
import {
    ServiceCall,
    serviceCallNewEntryData,
    serviceCallUpdateEntryData
} from '../models/serviceCall.js';
import logger from '../logger.js';

const pool = new Pool({
    user: 'postgres',
    password: 'postgresPW1',
    host: 'localhost',
    port: 5432,
    database: 'sfpd'
});

function handleError(res, err) {
    if (err instanceof DatabaseError) {
        logger.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
    } else if (err instanceof AggregateError) {
        logger.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.errors[0]);
    } else {
        logger.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
}

export const getServiceCalls = async (req, res) => {
    try {
        // const client = await pool.connect();
        // let result = await client.query("SELECT * FROM service_call");
        // using pool query does not require connect and release
        const result = await pool.query("SELECT * FROM service_call");
        let serviceCalls = new Array();
        for (const row of result.rows) {
            logger.trace(row, "Result row");
            let obj = ServiceCall(row);
            logger.trace(obj, "ServiceCall");
            serviceCalls.push(obj);
        }
        logger.trace("pool.idleCount = " + pool.idleCount);
        logger.trace("pool.totalCount = " + pool.totalCount);
        // using pool query does not require connect and release
        // client.release();
        res.status(StatusCodes.OK).send(serviceCalls);
    } catch (err) {
        handleError(res, err);
    }
};

export const getServiceCallsWithId = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM service_call WHERE cad_number = ${req.params.cadNumber}`);
        if (result.rowCount > 0) {
            let obj = ServiceCall(result.rows[0]);
            logger.trace(obj, "ServiceCall");
            res.status(StatusCodes.OK).send(obj);
        } else {
            res.status(StatusCodes.NOT_FOUND).send({ message: `Service call not found for cadNumber = ${req.params.cadNumber}` });
        }
    } catch (err) {
        handleError(res, err);
    }
};

export async function createServiceCall(req, res) {
    let executeUpdate = false;

    try {
        //req.log.warn({ body: req.body });
        // build new INSERT query based on JSON object data
        const newEntry = serviceCallNewEntryData(req.body);
        logger.trace(newEntry, "New service call entry");
        const result = await pool.query(newEntry.insertStr, newEntry.values);
        if (result.rowCount == 1) {
            let obj = ServiceCall(result.rows[0]);
            logger.trace(obj, "ServiceCall for insert");
            res.status(StatusCodes.CREATED).send(obj);
        } else {
            logger.warn("Failed to create: " + req.body);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(req.body);
        }
        return;
    } catch (err) {
        if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
            // if error contains duplicate, do update instead
            executeUpdate = true;
        } else {
            handleError(res, err);
            return;
        }
    }

    if (executeUpdate) {
        try {
            // build update query with the values
            const updateData = serviceCallUpdateEntryData(req.body);
            logger.trace(updateData, "Update service call entry");
            const result = await pool.query(updateData);
            if (result.rowCount == 1) {
                let obj = ServiceCall(result.rows[0]);
                logger.trace(obj, "ServiceCall for update");
                res.status(StatusCodes.CREATED).send(obj);
            } else {
                logger.debug(`Service call not found ${req.body.cadNumber}`);
                res.status(StatusCodes.NOT_FOUND).send({ message: `Service call not found for cadNumber = ${req.body.cadNumber}` });
            }
        } catch (err) {
            handleError(res, err);
        }
    }
};

export const deleteServiceCallsWithId = async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM service_call WHERE cad_number = ${req.params.cadNumber}`);
        if (result.rowCount == 0) {
            logger.debug(`Service call not found ${req.params.cadNumber}`);
            res.status(StatusCodes.NOT_FOUND).send({ message: `Service call not found for cadNumber = ${req.params.cadNumber}` });
        } else {
            res.status(StatusCodes.OK);
        }
    } catch (err) {
        handleError(res, err);
    }
};

export const updateServiceCallsWithId = async (req, res) => {
    try {
        // build update query with the values
        const updateData = serviceCallUpdateEntryData(req.body);
        logger.trace(updateData, "Update service call entry");
        const result = await pool.query(updateData);
        if (result.rowCount == 1) {
            let obj = ServiceCall(result.rows[0]);
            logger.trace(obj, "ServiceCall for update");
            res.status(StatusCodes.CREATED).send(obj);
        } else {
            logger.debug(`Service call not found ${req.params.cadNumber}`);
            res.status(StatusCodes.NOT_FOUND).send({ message: `Service call not found for cadNumber = ${req.params.cadNumber}` });
        }
    } catch (err) {
        handleError(res, err);
    }
};

