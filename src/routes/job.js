const { Router } = require('express');

const jobController = require('../controllers/jobController');
const { jobValidation } = require('../validations');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

router.route('/jobs').get(jobController.getJobs);

// Employer creates an job
router.route('/jobs/create')
    .post(
        isAuthenticated,
        authorizeRoles('employer'),
        validate(jobValidation.createJob),
        jobController.createJob
    );

// Employer selects a freelancer to do the job
router.route('/jobs/:id/freelancer')
    .post(
        isAuthenticated,
        authorizeRoles('employer'),
        jobController.selectFreelancer
    );

// Freelancer offers the job
router.route('/jobs/offer/:id')
    .post(
        isAuthenticated,
        authorizeRoles('freelancer'),
        jobController.offerJob
    );

// Freelancer cancels the offer
router.route('/jobs/offer/cancel/:id')
    .delete(
        isAuthenticated,
        authorizeRoles('freelancer'),
        jobController.cancelOffer
    );

// Freelancer views the jobs list which he/she has sent an offer
router.route('/jobs/offers')
    .get(
        isAuthenticated,
        authorizeRoles('freelancer'),
        jobController.getMyOfferJobs
    );

// Employer views and deletes the job details
router.route('/jobs/:id')
    .get(jobController.getJobDetails)
    .delete(
        isAuthenticated,
        authorizeRoles('employer'),
        jobController.deleteJob
    );

// Admin views the job details
router.route('/admin/jobs/:id')
    .delete(
        isAuthenticated,
        authorizeRoles('admin'),
        jobController.getJob
    );

module.exports = router;