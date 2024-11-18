import cron from 'node-cron';
import Sale from '@/models/sale';
import Product from '@/models/product';

export const initSalesCron = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Find and update expired sales
      const expiredSales = await Sale.find({
        status: 'active',
        endDate: { $lte: now }
      });

      for (const sale of expiredSales) {
        sale.status = 'expired';
        await sale.save();

        // Reset product sale status
        const product = await Product.findById(sale.product);
        if (product) {
          product.saleType = false;
          await product.save();
        }
      }

      // Activate scheduled sales
      const scheduledSales = await Sale.find({
        status: 'scheduled',
        startDate: { $lte: now },
        endDate: { $gt: now }
      });

      for (const sale of scheduledSales) {
        sale.status = 'active';
        await sale.save();

        // Update product sale status
        const product = await Product.findById(sale.product);
        if (product) {
          product.saleType = true;
          product.salePrice = sale.salePrice;
          product.salePriceDiscount = sale.salePriceDiscount;
          product.discountedSalePrice = sale.discountedSalePrice;
          await product.save();
        }
      }
    } catch (error) {
      console.error('Error updating sales:', error);
    }
  });
}; 