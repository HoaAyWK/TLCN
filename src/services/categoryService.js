const cloudinary = require('cloudinary');

const ApiError = require('../utils/ApiError');
const { Category } = require('../models');

const getAllCategoriesWithChildren = async () => {
    return Category
        .find({ parent: undefined }, '-createdAt -updatedAt')
        .populate({ path: 'children', select: '-createdAt -updatedAt' });
};

const getCategoryWithChildrenById = async (id) => {
    return Category.findById(id).populate('children');
};

const create = async (categoryBody) => {
    const { parent } = categoryBody;
    let parentCategory = undefined;

    if (parent) {
        parentCategory = await Category.findById(parent);

        if (!parentCategory) {
            return next(new ApiError(404, 'Parent category not found'));
        }
    }

    const categoryData = {
        name: categoryBody.name,
        description: categoryBody.description,
        parent
    };

    if (categoryBody.image) {
        const result = await cloudinary.v2.uploader.upload(image, {
            folder: 'categories'
        });

        categoryData.image = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    const newCategory = new Category(categoryData);
    newCategory.save();

    if (parentCategory) {
        parentCategory.children.push(newCategory._id);
        await parentCategory.save();
    }

    const category = await Category.findById(newCategory._id, '-createdAt -updatedAt');

    return category;
};

const updateCategory = async (id, updateBody) => {
    const { name, description, image, parent } = updateBody;
    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    if (name) {
        const nameExist = await Category.findOne({ name }).lean();

        if (nameExist) {
            throw new ApiError(400, 'Name already taken');
        }
    }

    if (parent && category.children.length > 0) {
        throw new ApiError(400, `Cannot attach this category to another category because it already has children's category`);
    }

    let parentCategory = undefined;

    if (parent) {
        parentCategory = await Category.findById(parent);

        if (!parentCategory) {
            throw new ApiError(404, 'Parent category not found');
        }
    }

    const categoryData = {
        name,
        description,
        parent
    };

    if (image) {

        if (category.image) {
            await cloudinary.v2.uploader.destroy(category.image.public_id);
        }

        const result = await cloudinary.v2.uploader.upload(image, {
            folder: 'categories'
        });

        categoryData.image = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        categoryData,
        {
            new: true,
            runValidators: true
        }
    )
    .lean();

    if (parentCategory) {
        parentCategory.children.push(updatedCategory._id);
        await parentCategory.save({ validateBeforeSave: false });
    }

    return updatedCategory;
};

const deleteCategory = async (id) => {
    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    if (category.children.length > 0) {
        throw new ApiError(400, `Please delete all this children's category first!`);
    }

    // TODO: check if this category already has jobs in it
    

    if (category.parent) {
        const parentCategory = await Category.findById(category.parent);

        if (!parentCategory) {
            return next(new ErrorHandler('Parent category not found', 404));
        }

        parentCategory.children.filter(item => item !== id);
        await parentCategory.save();
    }

    await category.remove();
};

module.exports = {
    getAllCategoriesWithChildren,
    getCategoryWithChildrenById,
    create,
    updateCategory,
    deleteCategory
};