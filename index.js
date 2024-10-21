require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const slackToken = process.env.SLACK_TOKEN; // Replace with your actual Slack token
const slackChannelId = '#api'; // Replace with your actual Slack channel ID

// Middleware to parse JSON request bodies
app.use(express.json());

// Function to send log to Slack
const sendLogToSlack = async (message) => {
  try {
    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: slackChannelId,
        text: message,
      },
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending log to Slack:', error);
  }
};

// Middleware to monitor API requests
app.use((req, res, next) => {
  // Log request method, URL, query parameters, and request body (for POST/PUT)
  const logMessage = `
    Method: ${req.method}
    URL: ${req.url}
    Query Params: ${JSON.stringify(req.query)}
    ${req.method === 'POST' || req.method === 'PUT' ? `Request Body: ${JSON.stringify(req.body)}` : ''}
  `;

  console.log(logMessage);

  // Send the log to Slack
  sendLogToSlack(logMessage.trim());

  res.send('Success!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
