/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre customer feedback API for the customer feedback reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /channel-rating-by-month
 *
 * Fetches average customer feedback ratings by channel for a specified month.
 *
 * Example:
 * fetch('/channel-rating-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/channel-rating-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month and channel are required'));
    }

    mongo (async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: {
              channel: "$channel",
              month: { $month: "$date" },
            },
            ratingAvg: { $avg: '$rating'}
          }
        },
        {
          $match: {
            '_id.month': Number(month)
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);

  } catch (err) {
    console.error('Error in /rating-by-date-range-and-channel', err);
    next(err);
  }
});


/**
 * @description
 *
 * Exenreco's Week 4: MAjor Development
 *
 * Task : Create an API to fetch customer feedback data by region
 * and build an Angular component to display customer feedback by region
 * using ChartComponent or TableComponent with 3 unit tests each.
 *
 * Comments: Implement the API to fetch customer feedback data by region
 * and create a component to display the data using either ChartComponent
 * or TableComponent. Ensure both have 3 unit tests.
 *
 * GET /regions
 *
 * Fetches regions form the customerFeedback collection
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 *
 * @Dev Exenreco Bell
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo(async db => {
      const regions = await db.collection('customerFeedback').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error in /regions', err);
    next(err);
  }
});


/**
 * @description
 *
 * Exenreco's Week 4: MAjor Development
 *
 * Task : Create an API to fetch customer feedback data by region
 * and build an Angular component to display customer feedback by region
 * using ChartComponent or TableComponent with 3 unit tests each.
 *
 * Comments: Implement the API to fetch customer feedback data by region
 * and create a component to display the data using either ChartComponent
 * or TableComponent. Ensure both have 3 unit tests.
 *
 * /customer-feedback-by-region:
 *   get:
 *     summary: Get customer feedback by region
 *     tags: [Customer Feedback]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         required: true
 *         description: The region to filter by
 *     responses:
 *       200:
 *         description: Array of customer feedback documents for the specified region
 */
router.get('/customer-feedback-by-region', (req, res, next) => {
  try {
    const { region } = req.query;

    if (!region) {
      return next(createError(400, 'region is required'));
    }

    mongo(async db => {
      const data = await db.collection('customerFeedback')
        .find({ region })
        .project({
          _id: 0,
          region: 1,
          customer: 1,
          salesperson: 1,
          salesAmount: 1,
          category: 1,
          product: 1,
          channel: 1,
          rating: 1,
          feedbackSentiment: 1,
          feedbackStatus: 1,
          feedbackSource: 1
        },{ $sort: { salesAmount: -1 } })
        .toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /customer-feedback-by-region', err);
    next(createError(500, 'Internal server error'));
  }
});

module.exports = router;