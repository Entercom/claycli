'use strict';
const _ = require('lodash'),
  nodeUrl = require('url'),
  replace = require('string-replace-async'),
  h = require('highland'),
  types = [
    '/_components',
    '/_pages',
    '/_users',
    '/_uris',
    '/_lists'
  ];

;

/**
 * add prefixes
 * @param {object} dispatch
 * @param {string} prefix
 * @returns {Stream}
 */
function add(dispatch, prefix) {
  const stringDispatch = JSON.stringify(dispatch);

  if (_.includes(prefix, 'http')) {
    // make sure it's a uri
    prefix = urlToUri(prefix);
  }

  return h(replace(stringDispatch, /"\/_?(components|uris|pages|lists|users)/g, (match, type) => Promise.resolve(`"${prefix}/_${type}`))).map(JSON.parse);
}

/**
 * remove prefixes
 * @param  {object} dispatch
 * @param  {string} prefix
 * @return {Stream}
 */
function remove(dispatch, prefix) {
  const stringDispatch = JSON.stringify(dispatch);

  if (_.includes(prefix, 'http')) {
    // make sure it's a uri
    prefix = urlToUri(prefix);
  }

  return h(replace(stringDispatch, new RegExp(`"${prefix}`, 'g'), '"')).map(JSON.parse);
}

/**
 * get site prefix from url
 * note: only works on api routes
 * @param  {string} url
 * @return {string}
 */
function getFromUrl(url) {
  let type = _.find(types, (t) => _.includes(url, t));

  if (type) {
    return url.slice(0, url.indexOf(type));
  } else {
    throw new Error(`Unable to find site prefix for ${url}`);
  }
}

/**
 * convert uri to url, using prefix provided
 * @param  {string} prefix
 * @param  {string} uri
 * @return {string}
 */
function uriToUrl(prefix, uri) {
  let type = _.find(types, (t) => _.includes(uri, t)),
    parts = uri.split(type),
    path = parts[1];

  return `${prefix}${type}${path}`;
}

/**
 * convert url to uri
 * @param  {string} url
 * @return {string}
 */
function urlToUri(url) {
  const parts = nodeUrl.parse(url);

  return parts.hostname + (parts.pathname === '/' ? '' : parts.pathname);
}

module.exports.add = add;
module.exports.remove = remove;
module.exports.getFromUrl = getFromUrl;
module.exports.uriToUrl = uriToUrl;
module.exports.urlToUri = urlToUri;