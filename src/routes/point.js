const { Router } = require('express');
const {
    getPoints,
    getPoint,
    createPoint,
    deletePoint
} = require('../controllers/pointController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/points').get(getPoints);
router.route('/points/:id').get(getPoint);

router.route('/admin/points/create')
    .post(isAuthenticated, authorizeRoles('admin'), createPoint);

router.route('/admin/points/delete/:id')
    .delete(isAuthenticated, authorizeRoles('admin'), deletePoint);

module.exports = router;