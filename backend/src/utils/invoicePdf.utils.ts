import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { formatUKDate } from './dateTime.utils';

interface InvoiceItem {
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metalType?: string;
  carat?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotalGBP: number;
  vatGBP: number;
  shippingCostGBP: number;
  totalGBP: number;
}

const GOLD = '#C9A84C';
const BLACK = '#1A1A1A';
const GREY = '#6B6B6B';

export const generateInvoicePdf = (data: InvoiceData, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(28).fillColor(GOLD).text('BRM JEWELLERY', 50, 50, { align: 'right' });
    doc.fontSize(9).fillColor(GREY).text('Luxury Jewellers · Est. UK', { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor(GREY).text('www.brmjewellery.co.uk', { align: 'right' });
    doc.text('info@brmjewellery.co.uk', { align: 'right' });

    // Divider
    doc.moveTo(50, 130).lineTo(545, 130).strokeColor(GOLD).lineWidth(0.5).stroke();

    // Invoice Title
    doc.fontSize(20).fillColor(BLACK).text('INVOICE', 50, 145);
    doc.fontSize(10).fillColor(GREY);
    doc.text(`Invoice No: ${data.invoiceNumber}`, 50, 175);
    doc.text(`Order No: ${data.orderNumber}`, 50, 190);
    doc.text(`Date: ${formatUKDate(data.createdAt)}`, 50, 205);

    // Bill To
    doc.fontSize(10).fillColor(BLACK).text('Bill To:', 350, 175);
    doc.fontSize(9).fillColor(GREY);
    doc.text(data.customerName, 350, 190);
    doc.text(data.customerEmail, 350, 205);
    const addr = data.shippingAddress;
    doc.text(addr.line1, 350, 220);
    if (addr.line2) doc.text(addr.line2, 350, 235);
    doc.text(`${addr.city}, ${addr.postcode}`, 350, addr.line2 ? 250 : 235);
    doc.text('United Kingdom', 350, addr.line2 ? 265 : 250);

    // Table Header
    const tableTop = 300;
    doc.moveTo(50, tableTop - 10).lineTo(545, tableTop - 10).strokeColor('#E5E5E5').lineWidth(0.5).stroke();

    doc.fontSize(9).fillColor(GREY);
    doc.text('ITEM', 50, tableTop);
    doc.text('SKU', 230, tableTop);
    doc.text('QTY', 320, tableTop, { width: 40, align: 'right' });
    doc.text('UNIT PRICE', 370, tableTop, { width: 80, align: 'right' });
    doc.text('TOTAL', 460, tableTop, { width: 80, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#E5E5E5').lineWidth(0.5).stroke();

    // Items
    let y = tableTop + 25;
    for (const item of data.items) {
      doc.fontSize(9).fillColor(BLACK);
      doc.text(item.title, 50, y, { width: 175 });
      if (item.metalType) {
        doc.fontSize(8).fillColor(GREY).text(`${item.metalType}${item.carat ? ` · ${item.carat}` : ''}`, 50, y + 12, { width: 175 });
      }
      doc.fontSize(9).fillColor(GREY).text(item.sku, 230, y);
      doc.fillColor(BLACK).text(String(item.quantity), 320, y, { width: 40, align: 'right' });
      doc.text(`£${item.unitPrice.toFixed(2)}`, 370, y, { width: 80, align: 'right' });
      doc.text(`£${item.total.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
      y += item.metalType ? 32 : 20;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#F0F0F0').lineWidth(0.3).stroke();
      y += 5;
    }

    // Totals
    y += 10;
    doc.moveTo(350, y).lineTo(545, y).strokeColor('#E5E5E5').lineWidth(0.5).stroke();
    y += 10;

    doc.fontSize(9).fillColor(GREY);
    doc.text('Subtotal (ex. VAT):', 350, y, { width: 100 });
    doc.fillColor(BLACK).text(`£${data.subtotalGBP.toFixed(2)}`, 460, y, { width: 80, align: 'right' });

    y += 18;
    doc.fillColor(GREY).text('Shipping:', 350, y, { width: 100 });
    doc.fillColor(BLACK).text(
      data.shippingCostGBP === 0 ? 'FREE' : `£${data.shippingCostGBP.toFixed(2)}`,
      460, y, { width: 80, align: 'right' }
    );

    y += 18;
    doc.fillColor(GREY).text('VAT (20%):', 350, y, { width: 100 });
    doc.fillColor(BLACK).text(`£${data.vatGBP.toFixed(2)}`, 460, y, { width: 80, align: 'right' });

    y += 5;
    doc.moveTo(350, y + 8).lineTo(545, y + 8).strokeColor(GOLD).lineWidth(1).stroke();
    y += 15;

    doc.fontSize(11).fillColor(BLACK).text('TOTAL (inc. VAT):', 350, y, { width: 100 });
    doc.fontSize(11).fillColor(GOLD).text(`£${data.totalGBP.toFixed(2)}`, 460, y, { width: 80, align: 'right' });

    // Footer
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#E5E5E5').lineWidth(0.5).stroke();
    doc.fontSize(8).fillColor(GREY).text(
      'Thank you for your purchase. All prices include UK VAT at 20%. BRM Jewellery is registered in England & Wales.',
      50, footerY + 10, { align: 'center', width: 495 }
    );
    doc.text(
      'Returns accepted within 30 days in accordance with the UK Consumer Rights Act 2015.',
      50, footerY + 22, { align: 'center', width: 495 }
    );

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};
