const webpush = require('web-push');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const VAPID_PUBLIC_KEY = 'BEY0n3-H3bPxVfrCZ6x1MR9S0B2jmelnCLCipewOKB_GAPb_2hJcC8R7h0pcQs4t9pBdW9PWFiWwFYURbGkT8is';
const VAPID_PRIVATE_KEY = 'EawIsn7lwsmpvrWoMMgq80YztBjOlF5TiXF-Osx1crw';

webpush.setVapidDetails(
    'mailto:tahcin49@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

let subscriptions = [];

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
});

app.post('/send-notification', (req, res) => {
    const payload = JSON.stringify({
        title: 'Event Reminder',
        body: 'An event is starting in 1 hour!'
    });

    subscriptions.forEach(subscription => {
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error('Error sending notification:', error);
        });
    });

    res.status(200).json({});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
