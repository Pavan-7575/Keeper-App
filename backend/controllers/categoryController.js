import CategoryModel from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const getCategories = async (req, res, next) => {
    try {
        const categories = await CategoryModel.getCategories(req.user.id);
        return sendSuccess(res, 200, 'Categories retrieved.', categories);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return sendError(res, 400, 'Category name is required.');
        }
        const category = await CategoryModel.createCategory(req.user.id, name.trim());
        return sendSuccess(res, 201, 'Category created.', category);
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        await CategoryModel.deleteCategory(req.user.id, req.params.id);
        return sendSuccess(res, 200, 'Category deleted.');
    } catch (error) {
        next(error);
    }
};
