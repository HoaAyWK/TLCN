const { Router } = require('express');

const { 
    getJobs,
    getJobDetails,
    deleteMyJob,
    deleteEmloyerJob,
    createJob,
    offerJob,
    cancelOffer
} = require('../controllers/jobController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/jobs').get(getJobs);
router.route('/jobs/create')
    .post(isAuthenticated, authorizeRoles('employer'), createJob);

router.route('/jobs/offer/:id')
    .post(isAuthenticated, authorizeRoles('freelancer'), offerJob);

router.route('/jobs/offer/cancel/:id')
    .delete(isAuthenticated, authorizeRoles('freelancer'), cancelOffer);

router.route('/jobs/:id')
    .get(getJobDetails)
    .delete(isAuthenticated, authorizeRoles('employer'), deleteMyJob);

router.route('/admin/jobs/:id')
    .delete(isAuthenticated, authorizeRoles('admin'), deleteEmloyerJob);

module.exports = router;