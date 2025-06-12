/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * fetch('/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    console.log('Fetching call duration report for date range:', startDate, endDate);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        {
          $unwind: '$agentDetails'
        },
        {
          $group: {
            _id: '$agentDetails.name',
            totalCallDuration: { $sum: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            callDuration: '$totalCallDuration'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            callDurations: { $push: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agents: 1,
            callDurations: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});


router.get('/teams', (req, res, next) => {
  try {
    mongo(async db => {
      const teams = await db.collection('agents').distinct('team');
      res.send(teams);
    }, next);
  } catch (err) {
    console.error('Error in /teams', err);
    next(err);
  }
});

router.get('/performance-by-team', (req, res, next) => {
  try {
    const { team } = req.query;

    if (!team) {
      return next(createError(400, 'Team is required'));
    }

    console.log(`Fetching performance for team: ${team}`);

    mongo(async db => {
      const data = await db.collection('agents').aggregate([
        { $match: { team: team } },
        {
          $lookup: {
            from: 'agentPerformance',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'performanceData'
          }
        },
        {
          $unwind: {
            path: '$performanceData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              team: '$team',
              name: '$name',
              phone: '$phone',
              email: '$email',
              region: '$region',
              agentId: '$agentId',
            },
            totalCallDuration: {
              $sum: {
                $ifNull: ['$performanceData.callDuration', 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            team: '$_id.team',
            name: '$_id.name',
            phone: '$_id.phone',
            email: '$_id.email',
            region: '$_id.region',
            agentId: '$_id.agentId',
            callDuration: '$totalCallDuration'
          }
        },
        { $sort: { callDuration: -1 } }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /performance-by-team', err);
    next(err);
  }
});

module.exports = router;