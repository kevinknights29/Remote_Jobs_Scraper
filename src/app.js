const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches jobs data from the specified URL.
 * @param {string} url - The URL to fetch the jobs data from.
 * @return {Promise<any>} - A promise that resolves to the fetched jobs data
 *  or null if an error occurs.
 */
async function fetchJobs(url) {
  try {
    const response = await axios.get(url);
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
      const id = $(element).attr('data-entity-urn').split(':')[3];
      const link = $(element).find('.base-card__full-link').attr('href').trim();
      const title = $(element).find('.base-search-card__title').text().trim();
      const location = $(element).find(
          '.job-search-card__location').text().trim();
      const date = $(element).find(
          '.job-search-card__listdate--new').text().trim();

      const jobData = {id, link, title, location, date};
      if (!jobListings.some((job) => job.id === id)) {
        jobListings.push(jobData);
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
