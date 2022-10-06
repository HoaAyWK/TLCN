const { Router } = require('express');
const pointController = require('../controllers/pointController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/points')
    .get(pointController.getPoints);
router.route('/points/:id')
    .get(pointController.getPoint);

router.route('/admin/points/create')
    .post(isAuthenticated,
        authorizeRoles('admin'),
        pointController.createPoint
    );

router.route('/admin/points/:id')
    .delete(isAuthenticated,
        authorizeRoles('admin'),
        pointController.deletePoint
    );

module.exports = router;