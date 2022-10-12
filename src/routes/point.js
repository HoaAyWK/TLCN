const { Router } = require('express');

const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const pointController = require('../controllers/pointController');
const { pointValidation } = require('../validations');
const { roleValues } = require('../config/roles');
const validate = require('../middlewares/validate');

const router = Router();

router.route('/points')
    .get(pointController.getPoints);
router.route('/points/:id')
    .get(validate(pointValidation.getPoint), pointController.getPoint);

router.route('/admin/points/create')
    .post(
        validate(pointValidation.createPoint),
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        pointController.createPoint
    );

router.route('/admin/points/:id')
    .delete(
        validate(pointValidation.deletePoint),
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        pointController.deletePoint
    );

module.exports = router;