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
        color: {
          name: string;
          value: string;
        };
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
                          Color: ${item.variant.color.name} | Size: ${item.variant.size} | Quantity: ${item.quantity}
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

export const sendOrderStatusEmail = async (
  to: string,
  orderDetails: {
    orderId: string;
    status: string;
    items: Array<{
      name: string;
      colorName: string;
      size: string;
      quantity: number;
      price: number;
      image: string;
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
  const statusMessages = {
    pending: 'Your order is pending confirmation',
    confirmed: 'Your order has been confirmed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled'
  };

  try {
    const mailOptions = {
      from: `"FashionStore" <${process.env.SMTP_USER}>`,
      to,
      subject: `Order Status Update - ${orderDetails.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f9fafb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
              .header { text-align: center; padding: 40px 20px; background: linear-gradient(45deg, #000000, #1a1a1a); color: #fff; }
              .content { padding: 32px; }
              .status-badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; font-weight: 500; margin-bottom: 24px; }
              .status-pending { background-color: #fef3c7; color: #92400e; }
              .status-confirmed { background-color: #dbeafe; color: #1e40af; }
              .status-shipped { background-color: #e0e7ff; color: #3730a3; }
              .status-delivered { background-color: #dcfce7; color: #166534; }
              .status-cancelled { background-color: #fee2e2; color: #991b1b; }
              .product-card { display: flex; background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
              .product-image { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }
              .product-details { margin-left: 16px; flex: 1; }
              .product-name { font-weight: 600; margin: 0 0 8px; color: #000; }
              .product-meta { font-size: 14px; color: #64748b; }
              .product-price { font-weight: 600; color: #000; margin-top: 8px; }
              .summary-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 32px; }
              .shipping-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 24px; }
              .footer { text-align: center; padding: 32px; background-color: #f8fafc; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Status Updated</h1>
                <p>Order #${orderDetails.orderId}</p>
              </div>

              <div class="content">
                <div class="status-badge status-${orderDetails.status}">
                  ${statusMessages[orderDetails.status as keyof typeof statusMessages]}
                </div>

                <h2>Order Details</h2>
                ${orderDetails.items.map(item => `
                  <div class="product-card">
                    <img src="${item.image}" alt="${item.name}" class="product-image"/>
                    <div class="product-details">
                      <h3 class="product-name">${item.name}</h3>
                      <p class="product-meta">
                        Color: ${item.colorName} | Size: ${item.size} | Qty: ${item.quantity}
                      </p>
                      <p class="product-price">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                `).join('')}

                <div class="summary-box">
                  <h3>Order Summary</h3>
                  <div style="display: flex; justify-content: space-between; margin-top: 12px;">
                    <span>Total Amount:</span>
                    <strong>₹${orderDetails.total.toFixed(2)}</strong>
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
                  <p>Thank you for shopping with us!</p>
                  <p style="color: #64748b; font-size: 14px;">
                    If you have any questions, please contact our support team.
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
    console.error('Failed to send order status email:', error);
  }
}; 