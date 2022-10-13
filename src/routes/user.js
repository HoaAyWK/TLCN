const { Router } = require('express');

const userController = require('../controllers/userController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const { userValidation } = require('../validations');
const { roleValues } = require('../config/roles');
const validate = require('../middlewares/validate');

const router = Router();

router.route('/profile')
    .get(isAuthenticated, userController.getUserProfile);

router.route('/profile/update')
    .put(isAuthenticated, userController.updateUserProfile);

router.route('/password/change')
    .put(
        isAuthenticated,
        validate(userValidation.changePassword),
        userController.changePassword
    );

router.route('/users/delete')
    .delete(isAuthenticated, userController.deleteMyAccount);

router.route('/admin/users')
    .get(isAuthenticated, authorizeRoles(roleValues.ADMIN), userController.getAllUsers);

router.route('/admin/users/:id')
    .get(
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        validate(userValidation.getUser),
        userController.getUser
    )
    .delete(
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        validate(userValidation.deleteUser),
        userController.deleteUser
    );
    
router.route('/admin/users/ban/:id')
    .get(isAuthenticated, authorizeRoles(roleValues.ADMIN), userController.banUser);

router.route('/users/:id/comments')
    .get(userController.getCommentsByUser);
    
module.exports = router;