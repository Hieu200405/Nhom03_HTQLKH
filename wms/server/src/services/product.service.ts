import { Types } from 'mongoose';
import { ProductModel } from '../models/product.model.js';
import { CategoryModel } from '../models/category.model.js';
import { buildPagedResponse, parsePagination } from '../utils/pagination.js';
import { conflict, notFound } from '../utils/errors.js';
import { recordAudit } from './audit.service.js';

type ListQuery = {
  page?: string;
  limit?: string;
  sort?: string;
  query?: string;
  categoryId?: string;
};

export const listProducts = async (query: ListQuery) => {
  const { page, limit, sort, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (query.query) {
    filter.$or = [
      { sku: new RegExp(query.query, 'i') },
      { name: new RegExp(query.query, 'i') }
    ];
  }
  if (query.categoryId) {
    filter.categoryId = new Types.ObjectId(query.categoryId);
  }

  const [total, items] = await Promise.all([
    ProductModel.countDocuments(filter),
    ProductModel.find(filter)
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  ]);

  const data = items.map((product) => ({
    id: product._id.toString(),
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    priceIn: product.priceIn,
    priceOut: product.priceOut,
    minStock: product.minStock,
    category: product.categoryId
      ? {
          id: product.categoryId instanceof Types.ObjectId
            ? product.categoryId.toString()
            : product.categoryId._id?.toString(),
          name: (product as any).categoryId?.name ?? null
        }
      : null,
    createdAt: product.createdAt
  }));

  return buildPagedResponse(data, total, { page, limit, sort, skip });
};

export const createProduct = async (
  payload: {
    sku: string;
    name: string;
    categoryId: string;
    unit: string;
    priceIn: number;
    priceOut: number;
    minStock: number;
  },
  actorId: string
) => {
  const category = await CategoryModel.findById(new Types.ObjectId(payload.categoryId)).lean();
  if (!category) {
    throw notFound('Category not found');
  }
  const existing = await ProductModel.findOne({ sku: payload.sku }).lean();
  if (existing) {
    throw conflict('SKU already exists');
  }
  const product = await ProductModel.create({
    ...payload,
    categoryId: category._id
  });
  await recordAudit({
    action: 'product.created',
    entity: 'Product',
    entityId: product._id,
    actorId,
    payload
  });
  return product.toObject();
};

export const updateProduct = async (
  id: string,
  payload: Partial<{
    sku: string;
    name: string;
    categoryId: string;
    unit: string;
    priceIn: number;
    priceOut: number;
    minStock: number;
  }>,
  actorId: string
) => {
  const product = await ProductModel.findById(new Types.ObjectId(id));
  if (!product) {
    throw notFound('Product not found');
  }
  if (payload.sku && payload.sku !== product.sku) {
    const duplicate = await ProductModel.findOne({ sku: payload.sku }).lean();
    if (duplicate) {
      throw conflict('SKU already exists');
    }
    product.sku = payload.sku;
  }
  if (payload.name) product.name = payload.name;
  if (payload.unit) product.unit = payload.unit;
  if (typeof payload.priceIn === 'number') product.priceIn = payload.priceIn;
  if (typeof payload.priceOut === 'number') product.priceOut = payload.priceOut;
  if (typeof payload.minStock === 'number') product.minStock = payload.minStock;
  if (payload.categoryId) {
    const category = await CategoryModel.findById(new Types.ObjectId(payload.categoryId)).lean();
    if (!category) {
      throw notFound('Category not found');
    }
    product.categoryId = category._id;
  }
  await product.save();
  await recordAudit({
    action: 'product.updated',
    entity: 'Product',
    entityId: product._id,
    actorId,
    payload
  });
  return product.toObject();
};

export const deleteProduct = async (id: string, actorId: string) => {
  const product = await ProductModel.findByIdAndDelete(new Types.ObjectId(id));
  if (!product) {
    throw notFound('Product not found');
  }
  await recordAudit({
    action: 'product.deleted',
    entity: 'Product',
    entityId: product._id,
    actorId,
    payload: { sku: product.sku }
  });
  return true;
};
