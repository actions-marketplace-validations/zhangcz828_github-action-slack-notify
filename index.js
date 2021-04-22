const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch')
const att= require('./src/utils');

(async () => {
  try {
    const status = core.getInput('status');
    const color = core.getInput('color');
    const messageId = core.getInput('message_id');
    const url = process.env['SLACK_WEBHOOK_URL'];
    const branch_name = process.env.GITHUB_REF.split('/').slice(2).join('/')

    if (branch_name != "main") {
      return
    }

    if (!url) {
      throw new Error('Missing SLACK_WEBHOOK_URL environment var')
    }

    const attachments = att.buildSlackAttachments({ status, color, github });

    const message = {
      attachments,
    };

    if (messageId) {
      message.ts = messageId;
    }

    const response = await sendMessage(message, url);

    core.setOutput('message_id', response.ts);
  } catch (error) {
    core.setFailed(error);
  }
})();

async function sendMessage(message, to) {
  try { 
    const res = await fetch(to, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(message)
    })

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }

    return await res
  } 
  catch (error) {
    throw error
  }
}
