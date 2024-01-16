const supabase = require('../config/supabase');

/**
 * Inserts a job listing into the database if it doesn't already exist.
 * @param {Object} job - The job listing object to be inserted.
 * @return {Promise<void>} - A promise that resolves once the job is inserted
 *  or an error occurs.
 */
async function insertJobListing(job) {
  // Check if the job already exists
  const {data: existingJobs, error: fetchError} = await supabase
      .from('jobs')
      .select('source_listing_id')
      .eq('source_listing_id', job.source_listing_id);

  if (fetchError) {
    console.error('Error fetching existing job:', fetchError);
    return;
  }

  if (existingJobs.length === 0) {
    // Insert the job listing as it's not in the database
    const {data, error: insertError} = await supabase
        .from('jobs')
        .insert([job]);

    if (insertError) {
      console.error('Error inserting job:', insertError);
      return;
    }

    console.log('Job inserted:', data);
  } else {
    console.log('Job already exists:', job.source_listing_id);
  }
}

module.exports = {
  insertJobListing,
};
