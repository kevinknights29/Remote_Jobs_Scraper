require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const {HttpProxyAgent} = require('http-proxy-agent');

/**
 * Fetches jobs data from the specified URL.
 * @param {string} url - The URL to fetch the jobs data from.
 * @return {Promise<any>} - A promise that resolves to the fetched jobs data
 *  or null if an error occurs.
 */
async function fetchJobs(url) {
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  const host = process.env.PROXY_HOST;
  const port = process.env.PROXY_PORT;

  const proxyUrl = `http://${username}:${password}@${host}:${port}`;
  const agent = new HttpProxyAgent(proxyUrl);

  try {
    const response = await axios.get(
        url,
        {httpAgent: agent, httpsAgent: agent},
    );
    return response.data;
  } catch (error) {
    console.error('[ERROR] Error fetching data:', error);
    return null;
  }
}

/**
 * Scrapes LinkedIn job listings from a specific URL and retrieves job data.
 * @return {Promise<void>} A promise that resolves when the scraping is
 *  complete.
 */
async function scrapeLinkedInJobs() {
  const baseUrl = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/jobs-in-worldwide';
  const queryParams = 'keywords=&location=Worldwide&f_TPR=&f_WT=2&' +
    'position=1&pageNum=0';
  let start = 0;
  const limit = 100;
  const jobListings = [];

  while (jobListings.length < limit) {
    const url = `${baseUrl}?${queryParams}&start=${start}`;
    const data = await fetchJobs(url);

    if (!data) break;

    const $ = cheerio.load(data);
    $('.base-card').each((_, element) => {
      const id = $(element).attr('data-entity-urn')?.split(':')[3];
      const linkElement = $(element).find('.base-card__full-link');
      const link = linkElement.attr('href') ?
        linkElement.attr('href').trim() : '';
      const titleElement = $(element).find('.base-search-card__title');
      const title = titleElement.length ? titleElement.text().trim() : '';
      const locationElement = $(element).find('.job-search-card__location');
      const location = locationElement.length ?
        locationElement.text().trim() : '';
      const dateElement = $(element).find('.job-search-card__listdate--new');
      const date = dateElement.length ? dateElement.text().trim() : '';

      // Ensure that the essential data (like id or title) is present
      if (id && title) {
        const jobData = {id, link, title, location, date};
        if (!jobListings.some((job) => job.id === id)) {
          jobListings.push(jobData);
        }
      }
    });

    start += 25; // LinkedIn loads jobs 25 at a time
    if ($('.base-card').length < 25) break;
    // Break if fewer than 25 jobs were loaded, indicating the end of listings
  }

  console.log(`Got ${jobListings.length} job listings`);
  // You can also output the listings here, e.g. console.log(jobListings);
}

scrapeLinkedInJobs();
