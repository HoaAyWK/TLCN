const { Router } = require('express');

const categoryController = require('../controllers/categoryController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/categories')
    .get(categoryController.getAllCategoriesWithChildren);
router.route('/categories/:id')
    .get(categoryController.getCategoryDetail);

router.route('/admin/categories/create')
    .post(isAuthenticated, authorizeRoles('admin'), categoryController.createCategory);

router.route('/admin/categories/:id')
    .put(isAuthenticated, authorizeRoles('admin'), categoryController.updateCategory)
    .delete(isAuthenticated, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;