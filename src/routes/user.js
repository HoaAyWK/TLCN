const { Router } = require('express');

const {
    getAllUsers,
    getUserDetails,
    getUserProfile,
    banUser,
    deleteUser,
    changePassword,
    updateUserProfile,
    deleteMyAccount,
} = require('../controllers/userController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/profile').get(isAuthenticated, getUserProfile);
router.route('/profile/update').put(isAuthenticated, updateUserProfile);
router.route('/password/change').put(isAuthenticated, changePassword);
router.route('/users/delete').delete(isAuthenticated, deleteMyAccount);

router.route('/admin/users').get(isAuthenticated, authorizeRoles('admin'), getAllUsers);
router.route('/admin/users/:id').get(isAuthenticated, authorizeRoles('admin'), getUserDetails);
router.route('/admin/users/ban/:id').get(isAuthenticated, authorizeRoles('admin'), banUser);
router.route('/admin/users/delete/:id').delete(isAuthenticated, authorizeRoles('admin'), deleteUser);

module.exports = router;