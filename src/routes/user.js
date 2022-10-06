const { Router } = require('express');

const userController = require('../controllers/userController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/profile').get(isAuthenticated, userController.getUserProfile);
router.route('/profile/update').put(isAuthenticated, userController.updateUserProfile);
router.route('/password/change').put(isAuthenticated, userController.changePassword);
router.route('/users/delete').delete(isAuthenticated, userController.deleteMyAccount);

router.route('/admin/users').get(isAuthenticated, authorizeRoles('admin'), userController.getAllUsers);
router.route('/admin/users/:id')
    .get(isAuthenticated, authorizeRoles('admin'), userController.getUser)
    .delete(isAuthenticated, authorizeRoles('admin'), userController.deleteUser);
    
router.route('/admin/users/ban/:id')
    .get(isAuthenticated, authorizeRoles('admin'), userController.banUser);
    
module.exports = router;