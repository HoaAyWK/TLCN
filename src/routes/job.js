const { Router } = require('express');

const jobController = require('../controllers/jobController');
const { jobValidation } = require('../validations');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const { roleValues } = require('../config/roles');
const validate = require('../middlewares/validate');

const router = Router();

router.route('/jobs').get(jobController.getJobs);

// Employer creates an job
router.route('/jobs/create')
    .post(
        isAuthenticated,
        authorizeRoles(roleValues.EMPLOYER),
        validate(jobValidation.createJob),
        jobController.createJob
    );

// Employer selects a freelancer to do the job
router.route('/jobs/:id/freelancer')
    .put(
        isAuthenticated,
        authorizeRoles(roleValues.EMPLOYER),
        jobController.selectFreelancer
    );

// Freelancer offers the job
router.route('/jobs/:id/offer')
    .post(
        isAuthenticated,
        authorizeRoles(roleValues.FREELANCER),
        jobController.offerJob
    );

// Freelancer cancels the offer
router.route('/jobs/:id/offer/cancel')
    .delete(
        isAuthenticated,
        authorizeRoles(roleValues.FREELANCER),
        jobController.cancelOffer
    );

// Freelancer views the jobs list which he/she has sent an offer
router.route('/jobs/offers')
    .get(
        isAuthenticated,
        authorizeRoles(roleValues.FREELANCER),
        jobController.getMyOfferJobs
    );

// Employer views and deletes the job details
router.route('/jobs/:id')
    .get(jobController.getJobDetails)
    .delete(
        isAuthenticated,
        authorizeRoles(roleValues.EMPLOYER),
        jobController.deleteJob
    );

// Employer views the job with all offers had sent to this job
router.route('/jobs/:id/offers')
    .get(
        isAuthenticated,
        authorizeRoles(roleValues.EMPLOYER),
        jobController.getJobWithOffers
    );

// Freelancer submits an assignment
router.route('/jobs/:id/submit')
    .put(
        isAuthenticated,
        authorizeRoles(roleValues.FREELANCER),
        jobController.submitAssigment
    );

// Employer accepts the assignment
router.route('/jobs/:id/finish')
    .put(
        isAuthenticated,
        authorizeRoles(roleValues.EMPLOYER),
        jobController.finishAssignment
    );

// Employer/Freelancer writes comment for the partner
router.route('/jobs/:id/comment')
    .post(
        isAuthenticated,
        authorizeRoles(roleValues.FREELANCER, roleValues.EMPLOYER),
        validate(jobValidation.addComment),
        jobController.addComment
    );

// Employer/Freelancer deletes an comment
router.route('/jobs/comment/:id')
    .delete(
        isAuthenticated,
        authorizeRoles(roleValues.FREELANCER, roleValues.EMPLOYER),
        validate(jobValidation.deleteComment),
        jobController.deleteComment
    );

// Admin views the job details
router.route('/admin/jobs/:id')
    .delete(
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        jobController.getJob
    );

module.exports = router;