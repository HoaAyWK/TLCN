const { Router } = require('express');

const categoryController = require('../controllers/categoryController');
const { categoryValidation } = require('../validations');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const { roleValues } = require('../config/roles');
const validate = require('../middlewares/validate');

const router = Router();

router.route('/categories')
    .get(categoryController.getAllCategoriesWithChildren);

router.route('/categories/:id')
    .get(validate(categoryValidation.getCategory), categoryController.getCategoryDetail);

router.route('/admin/categories/create')
    .post(
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        validate(categoryValidation.createCategory),
        categoryController.createCategory
    );

router.route('/admin/categories/:id')
    .put(
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        categoryController.updateCategory
    )
    .delete(
        isAuthenticated,
        authorizeRoles(roleValues.ADMIN),
        validate(categoryValidation.deleteCategory),
        categoryController.deleteCategory
    );

module.exports = router;