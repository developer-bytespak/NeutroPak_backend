import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state?: string | null;
  postalCode: string;
  country?: string | null;
}

// Order Confirmation Email - When Customer Places an Order
export const sendOrderConfirmationEmail = async (
  customerEmail: string,
  orderId: number,
  orderNo: string,
  customerName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
): Promise<void> => {
  try {
    // Validate API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set in environment variables');
      throw new Error('SendGrid API key not configured');
    }

    const itemsHtml = items
      .map(
        (item) =>
          `<div style="margin: 8px 0; padding: 8px; border-bottom: 1px solid #eee;">${item.name} <span style="color: #666;">(Qty: ${item.quantity})</span> <span style="float: right; font-weight: bold;">₨${item.price.toLocaleString()}</span></div>`
      )
      .join('');

    const today = new Date();
    const orderDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const msg = {
      to: customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sendgrid.net',
      subject: `Order Confirmation – Order #${orderNo}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: #daa520;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .section {
                margin: 20px 0;
                padding: 15px;
                background-color: #f9f9f9;
                border-left: 4px solid #daa520;
              }
              .section-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
                color: #333;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: white;
                margin: 0;
              }

            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="logo">🍯 NutreoPak</p>
                <h1 style="margin: 10px 0;">Order Confirmation</h1>
              </div>
              
              <div class="content">
                <h2>Hello ${customerName},</h2>
                
                <p>Thank you for your order. Your order has been successfully placed.</p>
                
                <div class="section">
                  <div class="section-title">Order Information</div>
                  <p><strong>Order ID:</strong> ${orderNo}</p>
                  <p><strong>Order Date:</strong> ${orderDate}</p>
                </div>
                
                <div class="section">
                  <div class="section-title">Items Ordered</div>
                  <div>${itemsHtml}</div>
                </div>
                
                <div class="section" style="background-color: #fff8dc; border-left-color: #daa520;">
                  <div style="font-size: 18px; font-weight: bold; text-align: right; color: #333;">
                    Total Amount: <span style="color: #daa520;">₨${total.toLocaleString()}</span>
                  </div>
                </div>
                
                <p style="margin-top: 30px;">We will notify you when your order is shipped.</p>
                
                <p style="margin-top: 20px; color: #666;">
                  If you have any questions, please contact us at <strong>nutreopak@gmail.com</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>© 2025 NutreoPak. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await sgMail.send(msg as any);
    console.log(`✅ Order confirmation email sent successfully to ${customerEmail} for order ${orderNo}`);
  } catch (error: any) {
    const errorMessage = error?.response?.body?.errors || error?.message || error;
    console.error(`❌ Error sending order confirmation email to ${customerEmail}:`, errorMessage);
    throw error;
  }
};

// Order Status Update Email - When Admin Updates Order Status
export const sendOrderStatusEmail = async (
  customerEmail: string,
  orderId: number,
  orderNo: string,
  customerName: string,
  status: string,
  items?: Array<{ name: string; quantity: number; price: number }>,
  total?: number,
  orderDetails?: OrderDetails
): Promise<void> => {
  try {
    // Validate API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set in environment variables');
      throw new Error('SendGrid API key not configured');
    }

    let subject = '';
    let message = '';
    let headerColor = '#daa520';
    let shouldSend = true;

    // Don't send email for PENDING status (confirmation email already sent)
    if (status === 'PENDING') {
      console.log(`ℹ️ Skipping status email for PENDING status (confirmation email already sent)`);
      shouldSend = false;
    } else if (status === 'CONFIRMED') {
      subject = `Your Order #${orderNo} Has Been Confirmed`;
      message = `<p>Good news! Your order #${orderNo} has been confirmed and is now being prepared for shipment.</p>
                 <p>We will notify you once it has been shipped.</p>`;
      headerColor = '#4169E1';
    } else if (status === 'SHIPPED') {
      subject = `Your Order #${orderNo} Has Been Shipped`;
      message = `<p>Your order #${orderNo} has been shipped and is on its way to you!</p>`;
      headerColor = '#FF6347';
    } else if (status === 'DELIVERED') {
      subject = `Order #${orderNo} Delivered`;
      message = `<p>Your order #${orderNo} has been successfully delivered.</p>
                 <p>We hope you enjoy your purchase!<br/>If you have any questions, please contact our support team.</p>`;
      headerColor = '#228B22';
    } else if (status === 'CANCELLED') {
      subject = `Your Order #${orderNo} Has Been Cancelled`;
      message = `<p>Your order #${orderNo} has been cancelled.</p>
                 <p>If you have any questions, please contact us.</p>`;
      headerColor = '#DC143C';
    }

    if (!shouldSend) {
      return;
    }

    // Build items HTML if provided
    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = items
        .map(
          (item) =>
            `<div style="margin: 8px 0; padding: 8px; border-bottom: 1px solid #eee;">${item.name} <span style="color: #666;">(Qty: ${item.quantity})</span> <span style="float: right; font-weight: bold;">₨${item.price.toLocaleString()}</span></div>`
        )
        .join('');
    }

    // Build shipping address HTML if provided
    let shippingAddressHtml = '';
    if (orderDetails) {
      shippingAddressHtml = `${orderDetails.firstName} ${orderDetails.lastName}<br/>
${orderDetails.address}<br/>
${orderDetails.city}${orderDetails.state ? ', ' + orderDetails.state : ''}<br/>
${orderDetails.country || 'Pakistan'} ${orderDetails.postalCode}`;
    }

    const msg = {
      to: customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sendgrid.net',
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: ${headerColor};
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .section {
                margin: 20px 0;
                padding: 15px;
                background-color: #f9f9f9;
                border-left: 4px solid ${headerColor};
              }
              .section-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
                color: #333;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: white;
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="logo">🍯 NutreoPak</p>
                <h1 style="margin: 10px 0;">Order Update</h1>
              </div>
              
              <div class="content">
                <h2>Hello ${customerName},</h2>
                
                ${message}
                
                <div class="section">
                  <div class="section-title">Order Details</div>
                  <p><strong>Order ID:</strong> ${orderNo}</p>
                  <p><strong>Status:</strong> ${status}</p>
                </div>

                ${itemsHtml ? `
                <div class="section">
                  <div class="section-title">Items Ordered</div>
                  <div>${itemsHtml}</div>
                </div>
                ` : ''}

                ${total ? `
                <div class="section">
                  <div class="section-title">Total Amount</div>
                  <h3 style="margin: 10px 0; color: ${headerColor};">₨${total.toLocaleString()}</h3>
                </div>
                ` : ''}

                ${shippingAddressHtml ? `
                <div class="section">
                  <div class="section-title">Shipping Address</div>
                  <p>${shippingAddressHtml}</p>
                </div>
                ` : ''}
                
                <p style="margin-top: 20px; color: #666;">
                  If you have any questions, please contact our support team at <strong>nutreopak@gmail.com</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>© 2025 NutreoPak. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await sgMail.send(msg as any);
    console.log(`✅ Order status email sent successfully to ${customerEmail} for order ${orderNo} - Status: ${status}`);
  } catch (error: any) {
    const errorMessage = error?.response?.body?.errors || error?.message || error;
    console.error(`❌ Error sending order status email to ${customerEmail}:`, errorMessage);
    throw error;
  }
};
