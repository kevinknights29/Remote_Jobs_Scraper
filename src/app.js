const {scrapeLinkedInJobs} = require('./utils/scraper');
const {insertJobListing} = require('./utils/database');

/**
 * Main function that scrapes LinkedIn job listings and inserts them
 *  into the database.
 * @return {Promise<void>} A promise that resolves when all job
 *  listings are inserted.
 */
async function main() {
  const jobListings = await scrapeLinkedInJobs('your-scraping-url');

  for (const job of jobListings) {
    // Transform the job data to match your database schema
    const jobData = {
      id: job.id,
      role: job.title,
      company: '', // Extract or derive if possible
      url: job.link,
      location: job.location,
      created_at: new Date().toISOString(),
      last_update_at: new Date().toISOString(),
      tags: [], // Populate if you have this data
    };

    await insertJobListing(jobData);
  }
}

main().catch(console.error);
