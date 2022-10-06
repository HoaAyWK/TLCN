const { Router } = require('express');

const categoryController = require('../controllers/categoryController');
const { categoryValidation } = require('../validations');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

router.route('/categories')
    .get(categoryController.getAllCategoriesWithChildren);

router.route('/categories/:id')
    .get(validate(categoryValidation.getCategory), categoryController.getCategoryDetail);

router.route('/admin/categories/create')
    .post(
        isAuthenticated,
        authorizeRoles('admin'),
        validate(categoryValidation.createCategory),
        categoryController.createCategory
    );

router.route('/admin/categories/:id')
    .put(
        isAuthenticated,
        authorizeRoles('admin'),
        categoryController.updateCategory
    )
    .delete(
        isAuthenticated,
        authorizeRoles('admin'),
        validate(categoryValidation.deleteCategory),
        categoryController.deleteCategory
    );

module.exports = router;