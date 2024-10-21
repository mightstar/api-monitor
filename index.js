require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000; // Render uses PORT from the environment

const slackToken = process.env.SLACK_TOKEN;
const slackChannelId = process.env.SLACK_CHANNEL_ID || '#api'; // Set in Render Dashboard

// Middleware to parse JSON request bodies
app.use(express.json());

// Function to send log to Slack
const sendLogToSlack = async (message) => {
  try {
    const response = await axios.post(
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
    if (response.data.ok) {
      console.log('Log sent to Slack successfully');
    } else {
      console.error('Error from Slack API:', response.data.error);
    }
  } catch (error) {
    console.error('Error sending log to Slack:', error.message);
  }
};

// Middleware to monitor API requests
app.use((req, res, next) => {
  const logMessage = `
    Method: ${req.method}
    URL: ${req.url}
    Query Params: ${JSON.stringify(req.query)}
    ${req.method === 'POST' || req.method === 'PUT' ? `Request Body: ${JSON.stringify(req.body)}` : ''}
  `;

  console.log(logMessage);

  // Send the log to Slack
  sendLogToSlack(logMessage.trim())
    .then(() => {
      res.send('Log sent to Slack successfully!');
    })
    .catch(() => {
      res.status(500).send('Failed to send log to Slack');
    });
});

// Health Check route (optional for Render's health checks)
app.get('/health', (req, res) => {
  res.send('Server is healthy');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
