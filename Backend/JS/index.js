require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const PORT = 3000

const app = express();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/commentThreads';

function extractTextFromHtml(html) {
  const $ = cheerio.load(html);
  return $.text();
}

async function fetchComments(videoId, maxComments = 1000) {
  let comments = [];
  let nextPageToken = '';
  
  try {
    while (comments.length < maxComments) {
      const response = await axios.get(BASE_URL, {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: 100,
          pageToken: nextPageToken,
          key: API_KEY,
        },
      });

      const fetchedComments = response.data.items.map(item => {
        const comment = item.snippet.topLevelComment.snippet;
        return {
          text: extractTextFromHtml(comment.textDisplay),
        };
      });

      comments = comments.concat(fetchedComments);
      nextPageToken = response.data.nextPageToken;

      if (!nextPageToken || comments.length >= maxComments) {
        break;
      }
    }

    return comments.slice(0, maxComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

async function saveCommentsToCsv(comments, filePath) {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'text', title: 'Comment' }
    ],
  });

  try {
    await csvWriter.writeRecords(comments);
    console.log(`Comments have been written to ${filePath}`);
  } catch (error) {
    console.error('Error writing to CSV file:', error.message);
  }
}

// Express route to fetch comments and download CSV
app.get('/download-csv', async (req, res) => {
  const { videoId } = req.query;
  
  if (!videoId) {
    return res.status(400).send('Video ID is required');
  }

  try {
    const comments = await fetchComments(videoId);

    if (comments.length === 0) {
      return res.status(404).send('No comments found');
    }

    const filePath = path.join(__dirname, `${videoId}-comments.csv`);

    // Save comments to CSV
    await saveCommentsToCsv(comments, filePath);

    // Set the response to download the file
    res.download(filePath, `${videoId}-comments.csv`, (err) => {
      if (err) {
        console.error('Error sending the file:', err);
        res.status(500).send('Error downloading the file');
      }

      // Clean up the file after sending it
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).send('Error processing the request');
  }
});

// Basic server setup
app.get('/', (req, res) => {
  res.send('Server Working');
});

app.listen(PORT, () => {
  console.log(`Server Running at http://localhost:3000`);
});
