const { Router } = require('express');

const { 
    getJobs,
    getJobDetails,
    deleteMyJob,
    deleteEmloyerJob,
    createJob,
    offerJob,
    cancelOffer,
    selectFreelancer,
    getMyOfferJobs
} = require('../controllers/jobController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/jobs').get(getJobs);

// Employer creates an job
router.route('/jobs/create')
    .post(isAuthenticated, authorizeRoles('employer'), createJob);

// Employer selects a freelancer to do the job
router.route('/jobs/:id/freelancer')
    .post(isAuthenticated, authorizeRoles('employer'), selectFreelancer);

// Freelancer offers the job
router.route('/jobs/offer/:id')
    .post(isAuthenticated, authorizeRoles('freelancer'), offerJob);

// Freelancer cancels the offer
router.route('/jobs/offer/cancel/:id')
    .delete(isAuthenticated, authorizeRoles('freelancer'), cancelOffer);

// Freelancer views the jobs list which he/she has sent an offer
router.route('/jobs/offers')
    .get(isAuthenticated, authorizeRoles('freelancer'), getMyOfferJobs);

// Employer views the job details
router.route('/jobs/:id')
    .get(getJobDetails)
    .delete(isAuthenticated, authorizeRoles('employer'), deleteMyJob);

// Admin views the job details
router.route('/admin/jobs/:id')
    .delete(isAuthenticated, authorizeRoles('admin'), deleteEmloyerJob);

module.exports = router;