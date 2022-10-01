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

const router = Router();

router.route('/profile').get(getUserProfile);
router.route('/profile/update').put(updateUserProfile);
router.route('/password/change').put(changePassword);
router.route('/profile/delete').delete(deleteMyAccount);

router.route('/admin/users').get(getAllUsers);
router.route('/admin/users/:id').get(getUserDetails);
router.route('/admin/users/ban/:id').get(banUser);
router.route('/admin/users/delete/:id').delete(deleteUser);

module.exports = router;