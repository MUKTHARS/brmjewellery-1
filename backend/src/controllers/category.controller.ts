import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import * as categoryService from '../services/category.service';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, category, 'Category created', HTTP_STATUS.CREATED);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const categories = await categoryService.getCategories(includeInactive);
  sendSuccess(res, categories, 'Categories retrieved');
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id);
  sendSuccess(res, category, 'Category retrieved');
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, category, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, null, 'Category deleted');
});

export const upsertAttributeTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await categoryService.upsertAttributeTemplate(req.params.id, req.body);
  sendSuccess(res, template, 'Attribute template saved', HTTP_STATUS.OK);
});

export const getAttributeTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await categoryService.getAttributeTemplate(req.params.id);
  sendSuccess(res, template, 'Attribute template retrieved');
});
