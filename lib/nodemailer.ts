import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendOrderConfirmationEmail = async (
  to: string,
  orderDetails: {
    orderId: string;
    items: Array<{
      product: {
        name: string;
        price: number;
        discountedPrice: number;
        variants: Array<{
          color: {
            name: string;
            value: string;
          };
          images: string[];
        }>;
      };
      variant: {
        color: string;
        colorName: string;
        size: string;
      };
      quantity: number;
    }>;
    total: number;
    shippingAddress: {
      fullName: string;
      streetAddress: string;
      city: string;
      state: string;
      pincode: string;
      phoneNumber: string;
    };
  }
) => {
  try {
    const mailOptions = {
      from: `"Vibly" <${process.env.SMTP_USER}>`,
      to,
      subject: '🎉 Your Order is Confirmed! - FashionStore',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f9fafb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
              .header { text-align: center; padding: 40px 20px; background: linear-gradient(45deg, #000000, #1a1a1a); color: #fff; }
              .content { padding: 32px; }
              .product-card { display: flex; background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
              .product-image { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; }
              .product-details { margin-left: 16px; flex: 1; }
              .product-name { font-weight: 600; margin: 0 0 8px; color: #000; }
              .product-meta { font-size: 14px; color: #64748b; }
              .product-price { font-weight: 600; color: #000; margin-top: 8px; }
              .savings { color: #16a34a; font-size: 14px; margin-top: 4px; }
              .summary-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 32px; }
              .shipping-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 24px; }
              .footer { text-align: center; padding: 32px; background-color: #f8fafc; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed! 🎉</h1>
                <p>Thank you for shopping with Vibly</p>
              </div>

              <div class="content">
                <h2>Order Details</h2>
                <p>Order ID: ${orderDetails.orderId}</p>

                <div class="products">
                  ${orderDetails.items.map(item => `
                    <div class="product-card">
                      <img src="${item.product.variants[0].images[0]}" alt="${item.product.name}" class="product-image"/>
                      <div class="product-details">
                        <h3 class="product-name">${item.product.name}</h3>
                        <p class="product-meta">
                          Color: ${item.variant.colorName} | Size: ${item.variant.size} | Quantity: ${item.quantity}
                        </p>
                        <p class="product-price">₹${(item.product.discountedPrice * item.quantity).toFixed(2)}</p>
                        ${item.product.price > item.product.discountedPrice ? `
                          <p class="savings">
                            You saved ₹${((item.product.price - item.product.discountedPrice) * item.quantity).toFixed(2)}
                          </p>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div class="summary-box">
                  <h3>Order Summary</h3>
                  <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span>Total</span>
                      <span>₹${orderDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div class="shipping-box">
                  <h3>Shipping Address</h3>
                  <p style="margin: 0;">
                    <strong>${orderDetails.shippingAddress.fullName}</strong><br/>
                    ${orderDetails.shippingAddress.streetAddress}<br/>
                    ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}<br/>
                    Phone: ${orderDetails.shippingAddress.phoneNumber}
                  </p>
                </div>

                <div class="footer">
                  <p>Need help? Contact our support team</p>
                  <a href="mailto:support@fashionstore.com" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">
                    Contact Support
                  </a>
                  <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
                    This is an automated email. Please do not reply to this message.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

const statusMessages = {
  pending: {
    title: 'Order Received',
    message: 'Your order has been received and is awaiting confirmation.',
    color: '#eab308'
  },
  confirmed: {
    title: 'Order Confirmed!',
    message: 'Your order has been confirmed and is being processed.',
    color: '#3b82f6'
  },
  shipped: {
    title: 'Order Shipped!',
    message: 'Your order is on its way to you.',
    color: '#8b5cf6'
  },
  delivered: {
    title: 'Order Delivered!',
    message: 'Your order has been delivered successfully.',
    color: '#22c55e'
  },
  cancelled: {
    title: 'Order Cancelled',
    message: 'Your order has been cancelled.',
    color: '#ef4444'
  }
} as const;

export const sendOrderStatusEmail = async (
  to: string,
  orderDetails: {
    orderId: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    items: any[];
    total: number;
    shippingAddress: {
      fullName: string;
      streetAddress: string;
      city: string;
      state: string;
      pincode: string;
      phoneNumber: string;
    };
  }
) => {
  const statusInfo = statusMessages[orderDetails.status] || statusMessages.confirmed;

  try {
    const mailOptions = {
      from: `"FashionStore" <${process.env.SMTP_USER}>`,
      to,
      subject: `Order Status Update - ${statusInfo.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f9fafb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
              .header { text-align: center; padding: 40px 20px; background: linear-gradient(45deg, #000000, #1a1a1a); color: #fff; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .header p { margin: 10px 0 0; opacity: 0.9; }
              .content { padding: 32px; }
              .order-info { margin-bottom: 32px; }
              .order-id { color: #4b5563; font-size: 14px; }
              .products-grid { margin: 24px 0; }
              .product-card { display: flex; background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
              .product-image { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; }
              .product-details { margin-left: 16px; flex: 1; }
              .product-name { font-weight: 600; margin: 0 0 8px; color: #000; }
              .product-meta { font-size: 14px; color: #64748b; }
              .product-price { font-weight: 600; color: #000; margin-top: 8px; }
              .savings { color: #16a34a; font-size: 14px; margin-top: 4px; }
              .summary-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 32px; }
              .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .summary-row.total { font-weight: 600; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
              .shipping-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 24px; }
              .shipping-title { font-weight: 600; margin: 0 0 12px; color: #000; }
              .shipping-address { margin: 0; color: #4b5563; }
              .footer { text-align: center; padding: 32px; background-color: #f8fafc; margin-top: 32px; }
              .support-button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px; }
              .support-button:hover { background-color: #1a1a1a; }
              .divider { height: 1px; background-color: #e2e8f0; margin: 24px 0; }
              .status-badge { display: inline-block; padding: 6px 12px; background-color: #dcfce7; color: #16a34a; border-radius: 9999px; font-size: 14px; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header" style="background-color: ${statusInfo.color}">
                <h1>${statusInfo.title}</h1>
                <p>${statusInfo.message}</p>
              </div>

              <div class="content">
                <div class="order-info">
                  <h2>Order Details</h2>
                  <p class="order-id">Order ID: ${orderDetails.orderId}</p>
                  <div class="status-badge" style="background-color: ${statusInfo.color}20; color: ${statusInfo.color}">
                    Status: ${orderDetails.status.toUpperCase()}
                  </div>
                </div>

                <div class="products-grid">
                  ${orderDetails.items.map(item => `
                    <div class="product-card">
                      <img src="${item.product.variants[0].images[0]}" alt="${item.product.name}" class="product-image"/>
                      <div class="product-details">
                        <h3 class="product-name">${item.product.name}</h3>
                        <p class="product-meta">
                          Size: ${item.variant.size} • Quantity: ${item.quantity}
                        </p>
                        <p class="product-price">₹${(item.product.discountedPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div class="summary-box">
                  <h3>Order Summary</h3>
                  <div class="summary-row">
                    <span>Total</span>
                    <span>₹${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>

                <div class="shipping-box">
                  <h3>Shipping Address</h3>
                  <p>
                    ${orderDetails.shippingAddress.fullName}<br/>
                    ${orderDetails.shippingAddress.streetAddress}<br/>
                    ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}<br/>
                    Phone: ${orderDetails.shippingAddress.phoneNumber}
                  </p>
                </div>

                ${orderDetails.status === 'shipped' ? `
                  <div class="tracking-info">
                    <h3>Tracking Information</h3>
                    <p>Your order is on its way! You can expect delivery in 2-3 business days.</p>
                  </div>
                ` : ''}
              </div>

              <div class="footer">
                <p>Need help with your order?</p>
                <a href="mailto:support@fashionstore.com" class="support-button">Contact Support</a>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send order status email:', error);
  }
}; 