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
  try {
    const mailOptions = {
      from: `"Vibly" <${process.env.SMTP_USER}>`,
      to,
      subject: '🎉 Your Order is Confirmed! - Vibly',
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
              <div class="header">
                <h1>Order Confirmed! 🎉</h1>
                <p>Thank you for shopping with FashionStore</p>
                <div class="status-badge" style="margin-top: 16px;">Order Placed Successfully</div>
              </div>

              <div class="content">
                <div class="order-info">
                  <h2 style="margin: 0 0 8px;">Order Details</h2>
                  <p class="order-id">Order ID: ${orderDetails.orderId}</p>
                  <p class="order-id">Placed on: ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
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
                        ${item.product.discountPercent > 0 ? `
                          <p class="savings">
                            You saved ₹${((item.product.price - item.product.discountedPrice) * item.quantity).toFixed(2)}
                          </p>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div class="summary-box">
                  <h3 style="margin: 0 0 16px;">Order Summary</h3>
                  <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₹${orderDetails.total.toFixed(2)}</span>
                  </div>
                  <div class="summary-row">
                    <span>Shipping</span>
                    <span style="color: #16a34a;">Free</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total</span>
                    <span>₹${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>

                <div class="shipping-box">
                  <h3 class="shipping-title">Shipping Address</h3>
                  <p class="shipping-address">
                    <strong>${orderDetails.shippingAddress.fullName}</strong><br/>
                    ${orderDetails.shippingAddress.streetAddress}<br/>
                    ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}<br/>
                    Phone: ${orderDetails.shippingAddress.phoneNumber}
                  </p>
                </div>

                <div class="divider"></div>

                <div style="text-align: center; color: #4b5563;">
                  <p style="margin: 0;">Estimated Delivery Date</p>
                  <p style="font-size: 18px; font-weight: 600; color: #000; margin: 8px 0;">
                    ${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 0 0 8px;">Need help with your order?</p>
                <a href="mailto:support@fashionstore.com" class="support-button">Contact Support</a>
                <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
                  This is an automated email. Please do not reply to this message.
                </p>
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