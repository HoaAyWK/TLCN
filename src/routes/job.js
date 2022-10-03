const { Router } = require('express');

const { 
    getJobs,
    getJobDetails,
    deleteMyJob,
    deleteEmloyerJob,
    createJob
} = require('../controllers/jobController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/jobs').get(getJobs);
router.route('/jobs/create')
    .post(isAuthenticated, authorizeRoles('employer'), createJob);
    
router.route('/jobs/:id')
    .get(getJobDetails)
    .delete(isAuthenticated, authorizeRoles('employer'), deleteMyJob);

router.route('/admin/jobs/:id')
    .delete(isAuthenticated, authorizeRoles('admin'), deleteEmloyerJob);

module.exports = router;