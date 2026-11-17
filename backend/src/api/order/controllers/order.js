'use strict';

/**
 * order controller
 *
 * checkout(): the "Checkout All" endpoint used by the storefront.
 *  1. Validates the customer information and the cart items.
 *  2. Inside ONE database transaction:
 *       - locks each product row (SELECT ... FOR UPDATE) so two customers
 *         can't buy the last item at the same time,
 *       - checks that the product exists, is active and has enough stock,
 *       - deducts the purchased quantity from the product stock,
 *       - saves the order.
 *     If any check fails, an error is thrown and the transaction is rolled
 *     back, so NO stock is changed and NO order is saved.
 */
const { createCoreController } = require('@strapi/strapi').factories;
const { errors } = require('@strapi/utils');

const { ValidationError } = errors;

const PAYMENT_METHODS = ['Cash on Delivery', 'GCash', 'Credit/Debit Card', 'Bank Transfer'];
const PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;
const MAX_ITEMS = 100;

const round2 = (n) => Math.round(n * 100) / 100;
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

function makeOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${date}-${rand}`;
}

/** Validate the request body and return clean values (throws ValidationError) */
function validateCheckout(body) {
  const data = body?.data ?? body ?? {};
  const customerName = clean(data.customerName);
  const contactNumber = clean(data.contactNumber).replace(/[\s-]/g, '');
  const deliveryAddress = clean(data.deliveryAddress);
  const paymentMethod = clean(data.paymentMethod);
  const fieldErrors = [];

  if (customerName.length < 3) fieldErrors.push({ path: ['customerName'], message: 'Full name is required (at least 3 characters).' });
  if (!PHONE_REGEX.test(contactNumber)) fieldErrors.push({ path: ['contactNumber'], message: 'Contact number must be a valid PH mobile number (09XXXXXXXXX).' });
  if (deliveryAddress.length < 10) fieldErrors.push({ path: ['deliveryAddress'], message: 'A complete delivery address is required.' });
  if (!PAYMENT_METHODS.includes(paymentMethod)) fieldErrors.push({ path: ['paymentMethod'], message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}.` });

  if (fieldErrors.length) {
    throw new ValidationError(fieldErrors.map((e) => e.message).join(' '), { errors: fieldErrors });
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new ValidationError('Your cart is empty.');
  }
  if (data.items.length > MAX_ITEMS) {
    throw new ValidationError(`Too many items in one order (max ${MAX_ITEMS}).`);
  }

  // Merge duplicate products and validate quantities
  const quantities = new Map();
  for (const item of data.items) {
    const documentId = clean(item?.documentId);
    const quantity = Number(item?.quantity);
    if (!documentId) throw new ValidationError('Each cart item needs a product id.');
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError('Each cart item quantity must be a whole number of at least 1.');
    }
    quantities.set(documentId, (quantities.get(documentId) || 0) + quantity);
  }

  return { customerName, contactNumber, deliveryAddress, paymentMethod, quantities };
}

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async checkout(ctx) {
    const input = validateCheckout(ctx.request.body);

    const order = await strapi.db.transaction(async ({ trx }) => {
      const lines = [];
      const problems = [];

      // 1) Lock + validate every product before changing anything
      for (const [documentId, quantity] of input.quantities) {
        const row = await trx('products').where('document_id', documentId).forUpdate().first();

        if (!row) {
          problems.push('A product in your cart no longer exists.');
          continue;
        }
        if (!row.is_active) {
          problems.push(`"${row.name}" is no longer available.`);
          continue;
        }
        if (row.stock < quantity) {
          problems.push(
            row.stock <= 0
              ? `"${row.name}" is out of stock.`
              : `Only ${row.stock} "${row.name}" left in stock (you ordered ${quantity}).`
          );
          continue;
        }

        const price = Number(row.price);
        lines.push({
          documentId,
          name: row.name,
          category: row.category,
          price,
          quantity,
          subtotal: round2(price * quantity),
          newStock: row.stock - quantity,
        });
      }

      if (problems.length) {
        // Throwing rolls back the whole transaction
        throw new ValidationError(`Checkout failed: ${problems.join(' ')}`, { problems });
      }

      // 2) Deduct the purchased quantity from each product's stock
      for (const line of lines) {
        await strapi.documents('api::product.product').update({
          documentId: line.documentId,
          data: { stock: line.newStock },
        });
      }

      // 3) Save the order
      const items = lines.map(({ newStock, ...rest }) => rest);
      return strapi.documents('api::order.order').create({
        data: {
          orderNumber: makeOrderNumber(),
          customerName: input.customerName,
          contactNumber: input.contactNumber,
          deliveryAddress: input.deliveryAddress,
          paymentMethod: input.paymentMethod,
          items,
          totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
          totalAmount: round2(items.reduce((sum, i) => sum + i.subtotal, 0)),
          orderStatus: 'pending',
        },
      });
    });

    ctx.status = 201;
    ctx.body = {
      data: {
        documentId: order.documentId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        items: order.items,
        totalItems: order.totalItems,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      },
      meta: { message: 'Checkout successful. Stock has been updated.' },
    };
  },
}));
