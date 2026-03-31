import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import { getFileUrl } from '../config/storage.config';
import * as productService from '../services/product.service';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const imageUrls = files.map((f) => getFileUrl('products', f.filename));
  const data = { ...req.body, attributes: JSON.parse(req.body.attributes || '[]') };
  if (data.baseCost) data.baseCost = parseFloat(data.baseCost);
  if (data.weightGrams) data.weightGrams = parseFloat(data.weightGrams);
  if (data.stockQty) data.stockQty = parseInt(data.stockQty);
  if (data.isActive !== undefined) data.isActive = data.isActive === true || data.isActive === 'true';
  const product = await productService.createProduct(data, imageUrls);
  sendSuccess(res, product, 'Product created', HTTP_STATUS.CREATED);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { products, total } = await productService.getProducts(pagination, {
    categoryId:   req.query.categoryId   as string,
    search:       req.query.search       as string,
    isActive:     req.query.isActive     as string,
    metalType:    req.query.metalType    as string,
    metalColor:   req.query.metalColor   as string,
    carat:        req.query.carat        as string,
    brand:        req.query.brand        as string,
    gemstone:     req.query.gemstone     as string,
    diamondShape: req.query.diamondShape as string,
    minWeight:    req.query.minWeight    as string,
    maxWeight:    req.query.maxWeight    as string,
    minPrice:     req.query.minPrice     as string,
    maxPrice:     req.query.maxPrice     as string,
    sortBy:       req.query.sortBy       as string,
    order:        req.query.order        as string,
  });
  sendSuccess(res, products, 'Products retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug);
  sendSuccess(res, product, 'Product retrieved');
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, product, 'Product retrieved');
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const newImageUrls = files.map((f) => getFileUrl('products', f.filename));
  const data = { ...req.body };
  if (data.attributes) data.attributes = JSON.parse(data.attributes);
  if (data.baseCost) data.baseCost = parseFloat(data.baseCost);
  if (data.weightGrams) data.weightGrams = parseFloat(data.weightGrams);
  if (data.stockQty) data.stockQty = parseInt(data.stockQty);
  if (data.isActive !== undefined) data.isActive = data.isActive === true || data.isActive === 'true';
  const product = await productService.updateProduct(req.params.id, data, newImageUrls);
  sendSuccess(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, null, 'Product deleted');
});

export const deleteProductImage = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProductImage(req.params.id, req.params.imageId);
  sendSuccess(res, null, 'Image deleted');
});

export const setPrimaryImage = asyncHandler(async (req: Request, res: Response) => {
  await productService.setPrimaryImage(req.params.id, req.params.imageId);
  sendSuccess(res, null, 'Primary image updated');
});
