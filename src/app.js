const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeLinkedInJobs(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    let jobListings = [];
    let previousHeight;

    while (jobListings.length < 100) {  // Example: Scrape 100 listings
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for scroll

        const content = await page.content();
        const $ = cheerio.load(content);

        $('.base-card').each((_, element) => {
            const id = $(element).attr('data-entity-urn').split(':')[3];
            const link = $(element).find('.base-card__full-link').attr('href').trim();
            const title = $(element).find('.base-search-card__title').text().trim();
            const location = $(element).find('.job-search-card__location').text().trim();
            const date = $(element).find('.job-search-card__listdate--new').text().trim();

            const jobData = { id, link, title, location, date };
            if (!jobListings.some(job => job.id === id)) {
                jobListings.push(jobData);
            }
        });

        // Handle 'See more jobs' button
        try {
             // Check for 'See more jobs' button and click if present
            const moreJobsButton = await page.$('.infinite-scroller__show-more-button');
            if (moreJobsButton) {
                await page.evaluate(button => button.scrollIntoView(), moreJobsButton);
                await moreJobsButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error('[ERROR] Error handling more jobs button:', error);
            break;
        } 
    }

    console.log(`Got ${jobListings.length} job listings`);
    // console.log(JSON.stringify(jobListings, null, 2));

    await browser.close();
}

const url = 'https://www.linkedin.com/jobs/jobs-in-worldwide?keywords=&location=Worldwide&f_TPR=&f_WT=2';
scrapeLinkedInJobs(url);