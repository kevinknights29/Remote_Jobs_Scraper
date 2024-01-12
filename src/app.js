const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeLinkedInJobs(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url);

    const content = await page.content();
    const $ = cheerio.load(content);

    let jobListings = [];

    $('.base-card').each((_, element) => {
            const id = $(element).attr('data-entity-urn').split(':')[3];
            const link = $(element).find('.base-card__full-link').attr('href').trim();
            const title = $(element).find('.base-search-card__title').text().trim();
            const location = $(element).find('.job-search-card__location').text().trim();
            const date = $(element).find('.job-search-card__listdate--new').text().trim();

            jobListings.push({ id, link, title, location, date });
    });

    console.log(`Got ${jobListings.length} job listings`);
    // console.log(JSON.stringify(jobListings, null, 2));

    await browser.close();
}

const url = 'https://www.linkedin.com/jobs/jobs-in-worldwide?keywords=&location=Worldwide&f_TPR=&f_WT=2';
scrapeLinkedInJobs(url);