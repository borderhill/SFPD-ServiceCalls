
import express from 'express';
import { getServiceCalls,
    getServiceCallsWithId,
    createServiceCall,
    deleteServiceCallsWithId,
    updateServiceCallsWithId } from '../controllers/serviceCallsController.js';
const router = express.Router();

router.get("/servicecalls", getServiceCalls);

router.get("/servicecalls/:cadNumber", getServiceCallsWithId);

router.post("/servicecalls", createServiceCall);

router.delete("/servicecalls/:cadNumber", deleteServiceCallsWithId);

router.put("/servicecalls/:cadNumber", updateServiceCallsWithId);

export default router;