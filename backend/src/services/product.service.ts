import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { slugify } from '../utils/slugify.utils';
import { PaginationOptions } from '../utils/pagination.utils';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

export const createProduct = async (data: CreateProductInput, imageUrls: string[] = []) => {
  const slug = data.slug || slugify(data.title);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new AppError(ERROR_MESSAGES.PRODUCT_SLUG_EXISTS, HTTP_STATUS.CONFLICT);

  const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (skuExists) throw new AppError(ERROR_MESSAGES.PRODUCT_SKU_EXISTS, HTTP_STATUS.CONFLICT);

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      story: data.story,
      brand: data.brand,
      categoryId: data.categoryId,
      metalType: data.metalType as any,
      metalColor: data.metalColor,
      carat: data.carat,
      gemstone: data.gemstone,
      diamondShape: data.diamondShape,
      weightGrams: data.weightGrams,
      baseCost: data.baseCost,
      sku: data.sku,
      isActive: data.isActive,
      stockQty: data.stockQty,
      attributes: {
        create: data.attributes.map((a) => ({
          fieldName: a.fieldName,
          fieldLabel: a.fieldLabel,
          value: a.value,
        })),
      },
      images: {
        create: imageUrls.map((url, i) => ({
          url,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      },
    },
    include: { attributes: true, images: true, category: true },
  });

  return product;
};

export const getProducts = async (
  pagination: PaginationOptions,
  filters: {
    categoryId?: string;
    search?: string;
    isActive?: string;
    metalType?: string;
    metalColor?: string;
    carat?: string;
    brand?: string;
    gemstone?: string;
    diamondShape?: string;
    minWeight?: string;
    maxWeight?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    order?: string;
  }
) => {
  const where: Record<string, unknown> = {};

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
  if (filters.carat) where.carat = { contains: filters.carat, mode: 'insensitive' };

  // Metal type: map colour variants to base enum
  if (filters.metalType) {
    const metalMap: Record<string, string> = {
      'Yellow Gold': 'GOLD',
      'White Gold':  'GOLD',
      'Rose Gold':   'GOLD',
      'Silver':      'SILVER',
      'Platinum':    'PLATINUM',
    };
    const mapped = metalMap[filters.metalType] ?? filters.metalType.toUpperCase();
    where.metalType = mapped;
    // When a colour variant is selected, also filter by metalColor
    if (['Yellow Gold', 'White Gold', 'Rose Gold'].includes(filters.metalType)) {
      where.metalColor = { contains: filters.metalType, mode: 'insensitive' };
    }
  }

  if (filters.gemstone)     where.gemstone     = { contains: filters.gemstone,     mode: 'insensitive' };
  if (filters.diamondShape) where.diamondShape = { contains: filters.diamondShape, mode: 'insensitive' };

  if (filters.minWeight || filters.maxWeight) {
    where.weightGrams = {
      ...(filters.minWeight ? { gte: parseFloat(filters.minWeight) } : {}),
      ...(filters.maxWeight ? { lte: parseFloat(filters.maxWeight) } : {}),
    };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.baseCost = {
      ...(filters.minPrice ? { gte: parseFloat(filters.minPrice) } : {}),
      ...(filters.maxPrice ? { lte: parseFloat(filters.maxPrice) } : {}),
    };
  }

  if (filters.search) {
    where.OR = [
      { title:    { contains: filters.search, mode: 'insensitive' } },
      { sku:      { contains: filters.search, mode: 'insensitive' } },
      { brand:    { contains: filters.search, mode: 'insensitive' } },
      { gemstone: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (filters.sortBy) orderBy[filters.sortBy] = filters.order || 'desc';
  else orderBy['createdAt'] = 'desc';

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { isPrimary: 'desc' } },
        _count: { select: { reviews: true } },
      },
    }),
  ]);

  return { products, total };
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      attributes: { orderBy: { fieldName: 'asc' } },
      images: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!product) throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return product;
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      attributes: { orderBy: { fieldName: 'asc' } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!product) throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return product;
};

export const updateProduct = async (id: string, data: UpdateProductInput, newImageUrls: string[] = []) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (data.slug && data.slug !== product.slug) {
    const slugExists = await prisma.product.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (slugExists) throw new AppError(ERROR_MESSAGES.PRODUCT_SLUG_EXISTS, HTTP_STATUS.CONFLICT);
  }

  if (data.sku && data.sku !== product.sku) {
    const skuExists = await prisma.product.findFirst({ where: { sku: data.sku, id: { not: id } } });
    if (skuExists) throw new AppError(ERROR_MESSAGES.PRODUCT_SKU_EXISTS, HTTP_STATUS.CONFLICT);
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.attributes) {
      await tx.productAttribute.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.story !== undefined && { story: data.story }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.metalType && { metalType: data.metalType as any }),
        ...(data.metalColor !== undefined && { metalColor: data.metalColor }),
        ...(data.carat !== undefined && { carat: data.carat }),
        ...(data.gemstone !== undefined && { gemstone: data.gemstone }),
        ...(data.diamondShape !== undefined && { diamondShape: data.diamondShape }),
        ...(data.weightGrams !== undefined && { weightGrams: data.weightGrams }),
        ...(data.baseCost !== undefined && { baseCost: data.baseCost }),
        ...(data.sku && { sku: data.sku }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.stockQty !== undefined && { stockQty: data.stockQty }),
        ...(data.attributes && {
          attributes: { create: data.attributes.map((a) => ({ fieldName: a.fieldName, fieldLabel: a.fieldLabel, value: a.value })) },
        }),
        ...(newImageUrls.length > 0 && {
          images: {
            create: newImageUrls.map((url, i) => ({ url, isPrimary: false, sortOrder: i + 100 })),
          },
        }),
      },
      include: { attributes: true, images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
  });

  return updated;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  await prisma.product.delete({ where: { id } });
};

export const deleteProductImage = async (productId: string, imageId: string): Promise<void> => {
  await prisma.productImage.delete({ where: { id: imageId, productId } });
};

export const setPrimaryImage = async (productId: string, imageId: string): Promise<void> => {
  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
};
