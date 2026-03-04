import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { slugify } from '../utils/slugify.utils';
import type { CreateCategoryInput, UpsertAttributeTemplateInput } from '../validators/category.validator';

export const createCategory = async (data: CreateCategoryInput) => {
  const slug = data.slug || slugify(data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError(ERROR_MESSAGES.CATEGORY_SLUG_EXISTS, HTTP_STATUS.CONFLICT);

  return prisma.category.create({
    data: { name: data.name, slug, description: data.description, parentId: data.parentId, isActive: data.isActive, sortOrder: data.sortOrder },
    include: { parent: true, children: true, _count: { select: { products: true } } },
  });
};

export const getCategories = async (includeInactive = false) => {
  return prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
      attributeTemplate: { include: { attributes: { orderBy: { sortOrder: 'asc' } } } },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      attributeTemplate: { include: { attributes: { orderBy: { sortOrder: 'asc' } } } },
      _count: { select: { products: true } },
    },
  });
  if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return category;
};

export const updateCategory = async (id: string, data: Partial<CreateCategoryInput>) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (data.slug && data.slug !== category.slug) {
    const existing = await prisma.category.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (existing) throw new AppError(ERROR_MESSAGES.CATEGORY_SLUG_EXISTS, HTTP_STATUS.CONFLICT);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
    include: { parent: true, children: true, _count: { select: { products: true } } },
  });
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  if (category._count.products > 0) throw new AppError(ERROR_MESSAGES.CATEGORY_HAS_PRODUCTS, HTTP_STATUS.CONFLICT);
  await prisma.category.delete({ where: { id } });
};

export const upsertAttributeTemplate = async (categoryId: string, data: UpsertAttributeTemplateInput) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return prisma.$transaction(async (tx) => {
    let template = await tx.categoryAttributeTemplate.findUnique({ where: { categoryId } });

    if (!template) {
      template = await tx.categoryAttributeTemplate.create({ data: { categoryId } });
    }

    // Delete existing fields and recreate
    await tx.attributeField.deleteMany({ where: { templateId: template.id } });

    await tx.attributeField.createMany({
      data: data.attributes.map((attr) => ({
        templateId: template!.id,
        name: attr.name,
        label: attr.label,
        fieldType: attr.fieldType as any,
        options: attr.options,
        isRequired: attr.isRequired,
        isFilterable: attr.isFilterable,
        unit: attr.unit,
        placeholder: attr.placeholder,
        sortOrder: attr.sortOrder,
      })),
    });

    return tx.categoryAttributeTemplate.findUnique({
      where: { id: template.id },
      include: { attributes: { orderBy: { sortOrder: 'asc' } } },
    });
  });
};

export const getAttributeTemplate = async (categoryId: string) => {
  return prisma.categoryAttributeTemplate.findUnique({
    where: { categoryId },
    include: { attributes: { orderBy: { sortOrder: 'asc' } } },
  });
};
