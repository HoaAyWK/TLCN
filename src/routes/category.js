const { Router } = require('express');

const { 
    getAllCategoriesWithChildren,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = Router();

router.route('/categories').get(getAllCategoriesWithChildren);
router.route('/categories/:id').get(getCategoryDetail);

router.route('/admin/categories/create')
    .post(isAuthenticated, authorizeRoles('admin'), createCategory);

router.route('/admin/categories/:id')
    .put(isAuthenticated, authorizeRoles('admin'), updateCategory)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteCategory);

module.exports = router;