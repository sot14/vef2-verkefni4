// TODO útfæra proxy virkni
import express from 'express';
import fetch from 'node-fetch';
import { getCached, setCached } from './cache.js';
import { timerStart, timerEnd } from './time.js';

export const proxy = express.Router();

function getURL(type, period) {
  return `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${type}_${period}.geojson`;
}

async function fetchFromURL(url) {
  const data = await fetch(url);
  const json = await data.json();
  return json;
}

async function getData(req, res) {
  const { type, period } = req.query;
  const targetUrl = getURL(type, period);
  const cacheKey = `type:${type}-period:${period}`;
  let earthquakeData;

  const timer = timerStart();
  const cached = await getCached(cacheKey);

  if (cached) {
    earthquakeData = cached;
  } else {
    earthquakeData = await fetchFromURL(targetUrl);
    setCached(cacheKey, earthquakeData, 60);
  }

  //   earthquakeData = await fetchFromURL(targetUrl);
  const fetchTime = timerEnd(timer);

  // CACHE

  const result = {
    data: earthquakeData,
    info: {
      cached: cached != null,
      elapsed: fetchTime,
    },
  };

  // NO CACHE
  //   const result = {
  //     data: earthquakeData,
  //     time: fetchTime,
  //   };

  return res.json(result);
}

proxy.get('/', getData);
