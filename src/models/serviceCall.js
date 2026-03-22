import * as dbutil from './dbutil.js';
import logger from '../logger.js';

/* 
** Return: 
**  SQL insert string with all fields based on JSON properties
**  Property like cadNumber will translate to cad_number column
**                pdIncidentReport to pd_incident_report
**
**  values will contain a value array from JSON in the order for the INSERT
**  SQL statement
**
** insertStr contains: 'INSERT INTO service_call (cad_number, pd_incident_report, ... ) 
**                      VALUES($1, $2, ... ) RETURNING *'
** values contains array: ['250321616', 'PD250062759', ...]
*/
export function serviceCallNewEntryData(obj) {
    logger.trace(obj, "Build new entry db query for service call");
    const map = new Map(Object.entries(obj));
    let sqlColumnsStr = "INSERT INTO service_call (";
    let valuesStr = " VALUES (";
    let values = new Array()
    let indexVal = 0;
    for (const key of map.keys()) {
        let keyTemp = key.replace(/([A-Z])/g, '_$1').toLowerCase().trim();
        sqlColumnsStr = sqlColumnsStr.concat(`${keyTemp}, `);
        indexVal = indexVal + 1;
        valuesStr = valuesStr.concat(`$${indexVal}, `);
        // add value to the values
        values.push(map.get(key));
    }
    let insertStr = sqlColumnsStr.substring(0, sqlColumnsStr.length - 2) +
        ")" + valuesStr.substring(0, valuesStr.length - 2) +
        ") RETURNING *";
    logger.trace(insertStr, "sql statement for new entry");

    return {
        insertStr: insertStr,
        values: values
    }
}

/* 
** Return: 
**  SQL update string with all fields based on JSON properties
**  Property like cadNumber will translate to cad_number column
**                pdIncidentReport to pd_incident_report
**
**  UPDATE service_call SET pd_incident_report = 'PD250062759', 
**                          police_district = 'TENDERLOIN', ....
**      WHERE cad_number = '250321698' 
**
*/
export function serviceCallUpdateEntryData(obj) {
    logger.trace(obj, "Build update db query for service call");
    const map = new Map(Object.entries(obj));
    let sqlStr = "UPDATE service_call SET ";
    const whereStr = " WHERE cad_number = ".concat(map.get("cadNumber"));
    map.delete("cadNumber");  // remove key cadNumber from map

    for (const key of map.keys()) {
        let columnStr = key.replace(/([A-Z])/g, '_$1').toLowerCase().trim();
        sqlStr = sqlStr.concat(`${columnStr} = '${map.get(key)}', `);
    }

    let updateStr = sqlStr.substring(0, sqlStr.length - 2)
        .concat(whereStr)
        .concat(" RETURNING *");
    logger.trace(updateStr, "sql statement for update");
    return updateStr;
}

/*
** Create service call instance based on sql column names and values
**
** Convert column name underscores with capital letter like
**   cad_number to cadNumber
**
*/
export function ServiceCall(sqlRow) {
    const map = new Map(Object.entries(sqlRow));
    let serviceCall = new Map();
    for (const key of map.keys()) {
        serviceCall.set(dbutil.fromSQLColumnToPropertyName(key), sqlRow[key])
    }
    const obj = Object.fromEntries(serviceCall);
    return obj;
}

export default {
    serviceCallNewEntryData,
    serviceCallUpdateEntryData,
    ServiceCall
};
