
import express from 'express';
import {
    getServiceCalls,
    getServiceCallWithId,
    createServiceCall,
    deleteServiceCallWithId,
    updateServiceCallWithId
} from '../controllers/serviceCallsController.js';
const router = express.Router();

router.get("/servicecalls", getServiceCalls);

router.get("/servicecalls/:cadNumber", getServiceCallWithId);

router.post("/servicecalls", createServiceCall);

router.delete("/servicecalls/:cadNumber", deleteServiceCallWithId);

router.put("/servicecalls/:cadNumber", updateServiceCallWithId);

export default router;