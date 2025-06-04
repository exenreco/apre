/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});

/**
 * @description
 * GET /sales-by-month
 * Fetches sales data for a specific month.
 * Example:
 * fetch('/sales-by-month?month=8')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/sales-by-month', (req, res, next) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).send('Month parameter is missing');
    }

    mongo (async db => {
      const salesByMonth = await db.collection('sales').aggregate([
        {
          $match: {
            $expr: {
              $eq: [ { $month: '$date' }, parseInt(month) ]
            }
          }
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            month: { $dateToString: { format: '%B', date: '$date' } },
            region: 1,
            product: 1,
            category: 1,
            customer: 1,
            salesperson: 1,
            channel: 1,
            amount: 1
          }
        }
      ]).toArray();

      res.send(salesByMonth);
    }, next);

  } catch (err) {
    console.error('Error getting sales data by month: ', err);
    next(err);
  }
});

/**
 * @package Week 2 - major Development
 *
 * @developer Exenreco Bell
 *
 * @description
 *
 * GET /products
 *
 * Fetches a list of distinct product names.
 *
 * Example:
 * fetch('/products')
 *   .then(response => response.json())
 *   .then(data => console.log(data));
 */
router.get('/products', (req, res, next) => {
  try {
    mongo(async db => {
      const products = await db.collection('sales').distinct('product');
      res.send(products);
    }, next);
  } catch (err) {
    console.error('Error getting products: ', err);
    next(err);s
  }
});

/**
 * @package Week 2 - major Development
 *
 * @developer Exenreco Bell
 *
 * @description
 *
 * GET /sales-by-region-and-product
 *
 * Fetches sales data filtered by region and product.
 *
 * Example:
 * fetch('/sales-by-region-and-product?region=north&product=widget')
 *   .then(response => response.json())
 *   .then(data => console.log(data));
 */
router.get('/sales-by-region-and-product', (req, res, next) => {
  try {
    const region = req.query.region;
    const product = req.query.product;

    // Validate parameters
    if (!region || !product) {
      return res.status(400).send('Both region and product parameters are required');
    }

    mongo(async db => {
      const salesReport = await db.collection('sales').aggregate([
        // Match specific region and product
        {
          $match: {
            region: region,
            product: product
          }
        },
        // Project needed fields
        {
          $project: {
            _id: 0,
            region: 1,
            salesperson: 1,
            product: 1,
            amount: 1
          }
        },
        // Sort results
        {
          $sort: {
            salesperson: 1
          }
        }
      ]).toArray();

      res.send(salesReport);
    }, next);
  } catch (err) {
    console.error('Error getting sales by region and product: ', err);
    next(err);
  }
});

module.exports = router;