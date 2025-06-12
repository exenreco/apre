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

/**
 * @description
 *
 * Week 3: MAjor Development
 *
 * Task : Create an API to fetch agent performance data by team and build an
 * Angular component to display agent performance by team using ChartComponent
 * or TableComponent with 3 unit tests each.
 *
 * GET /team
 *
 * Fetches teams for the agentPerformance prototype
 *
 * Example:
 * fetch('/team')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 *
 * @Dev Exenreco Bell
 */
router.get('/teams', (req, res, next) => {
  try {
    mongo(async db => {
      const teams = await db.collection('agentPerformance').distinct('team');
      res.send(teams);
    }, next);
  } catch (err) {
    console.error('Error in /teams', err);
    next(err);
  }
});

/**
 * @description
 *
 * Week 3: MAjor Development
 *
 * Task : Create an API to fetch agent performance data by team and build an
 * Angular component to display agent performance by team using ChartComponent
 * or TableComponent with 3 unit tests each.
 *
 * GET /performance-by-team
 *
 * Fetches performance data form agentPerformance
 *
 * Example:
 * fetch('/performance-by-team?team=Team Name')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 *
 * @Dev Exenreco Bell
 */
router.get('/performance-by-team', (req, res, next) => {
  try {
    const { team } = req.query;
    if (!team) return next(createError(400, 'Team is required'));

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        { $match: { team } },
        { $project: {
            team: 1,
            region: 1,
            callDuration: 1,
            resolutionTime: 1,
          }
        },
        { $lookup: {
            from: 'agentPerformance',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'performanceData'
          }
        },
        { $unwind: { path: '$performanceData', preserveNullAndEmptyArrays: true } },
        { $group: {
          _id: {
            team: '$team',
            region: '$region',
            callDuration: '$callDuration',
            resolutionTime: '$resolutionTime'
          }
        }},
        { $project: {
          _id: 0,
          team: '$_id.team',
          region: '$_id.region',
          callDuration: '$_id.callDuration',
          resolutionTime: '$_id.resolutionTime'
        }},
        { $sort: { callDuration: -1 } }
      ]).toArray();

      res.send(data);
    }, next);
  }
  catch (err) { next(err); }
});

module.exports = router;