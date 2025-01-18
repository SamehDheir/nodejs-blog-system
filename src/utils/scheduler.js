const schedule = require("node-schedule");

const schedulePostPublish = (post, publishAt) => {
  const publishDate = new Date(publishAt);
  const currentDate = new Date();

  // Check if the date is in the past or the same day but earlier
  if (publishDate <= currentDate) {
    // If the date is in the past or the same day earlier, publish the post immediately.
    post.published = true;
    post.publishAt = null;
    post.save();
    console.log(`Post published immediately: ${post.title}`);
  } else {
    // If the date is future, schedule the publication.
    schedule.scheduleJob(publishDate, async () => {
      post.published = true;
      await post.save();
      console.log(`Post published: ${post.title}`);
    });
  }
};

module.exports = { schedulePostPublish };
