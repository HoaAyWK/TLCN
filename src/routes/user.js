const { Router } = require('express');

const {
    getAllUsers,
    getUserDetails,
    banUser,
    deleteUser,
} = require('../controllers/userController');

const router = Router();

router.route('/admin/users').get(getAllUsers);
router.route('/admin/users/:id').get(getUserDetails);
router.route('/admin/users/ban/:id').get(banUser);
router.route('/admin/users/delete/:id').delete(deleteUser);

module.exports = router;