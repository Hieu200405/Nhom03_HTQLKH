import PDFDocument from 'pdfkit';
import { InventoryModel } from '../models/inventory.model.js';
import { ProductModel } from '../models/product.model.js';
import { ReceiptModel } from '../models/receipt.model.js';
import { DeliveryModel } from '../models/delivery.model.js';
import { StocktakeModel } from '../models/stocktake.model.js';
import { AdjustmentModel } from '../models/adjustment.model.js';
import { ReturnModel } from '../models/return.model.js';

const toObject = (doc: unknown) => JSON.parse(JSON.stringify(doc));

export const getOverviewReport = async () => {
  const [products, receipts, deliveries, adjustments, returns] = await Promise.all([
    ProductModel.countDocuments(),
    ReceiptModel.countDocuments(),
    DeliveryModel.countDocuments(),
    AdjustmentModel.countDocuments(),
    ReturnModel.countDocuments()
  ]);
  return {
    products,
    receipts,
    deliveries,
    adjustments,
    returns
  };
};

export const getInventoryReport = async () => {
  const rows = await InventoryModel.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$productId',
        sku: { $first: '$product.sku' },
        name: { $first: '$product.name' },
        totalQty: { $sum: '$quantity' },
        minStock: { $first: '$product.minStock' }
      }
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        sku: 1,
        name: 1,
        totalQty: 1,
        minStock: 1,
        status: {
          $cond: [{ $lt: ['$totalQty', '$minStock'] }, 'belowMin', 'ok']
        }
      }
    }
  ]);
  return rows.map(toObject);
};

const groupByDate = (field: string) => [
  {
    $addFields: {
      totalQty: { $sum: '$lines.qty' }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: `$${field}` }
      },
      totalQty: { $sum: '$totalQty' },
      documents: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
];

export const getInboundReport = async () => {
  const rows = await ReceiptModel.aggregate(groupByDate('date'));
  return rows.map((row) => ({
    date: row._id,
    totalQty: row.totalQty,
    documents: row.documents
  }));
};

export const getOutboundReport = async () => {
  const rows = await DeliveryModel.aggregate(groupByDate('date'));
  return rows.map((row) => ({
    date: row._id,
    totalQty: row.totalQty,
    documents: row.documents
  }));
};

export const getStocktakeReport = async () => {
  const rows = await StocktakeModel.aggregate([
    {
      $project: {
        code: 1,
        status: 1,
        date: 1,
        discrepancies: {
          $sum: {
            $map: {
              input: '$items',
              as: 'item',
              in: { $abs: { $subtract: ['$$item.countedQty', '$$item.systemQty'] } }
            }
          }
        }
      }
    },
    { $sort: { date: -1 } }
  ]);
  return rows.map(toObject);
};

export const createPdfBuffer = async (title: string, data: any) => {
  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];
  return await new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown();

    const entries = Array.isArray(data) ? data : Object.entries(data);
    entries.forEach((entry: any) => {
      if (Array.isArray(data)) {
        doc.fontSize(12).text(JSON.stringify(entry));
      } else {
        const [key, value] = entry;
        doc.fontSize(12).text(`${key}: ${JSON.stringify(value)}`);
      }
      doc.moveDown(0.5);
    });

    doc.end();
  });
};
