require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
const serverless = require('serverless-http');
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: apiKey,
  });
const openai = new OpenAIApi(configuration);

// read system.txt file
const systemMessage = fs.readFileSync('system.txt', 'utf-8'); // read system.txt file

//CORS 이슈 해결
let corsOptions = {
    origin: 'https://tarsumy.pages.dev',
    credentials: true
}
app.use(cors(corsOptions));

//POST 요청 받을 수 있게 만듬
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// POST method route
app.post('/tarsumy', async function (req, res) {
    let userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'User message is required' });
    }

    // construct messages array based on user message
    let messages = [
        {role: "system", content: systemMessage},
        {role: "user", content: userMessage}
    ];

    const maxRetries = 3;
    let retries = 0;
    let completion;

    while (retries < maxRetries) {
        try {
            completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 1.0,
                top_p: 0.9,
                max_tokens: 412,
                messages: messages,
            });
            break;
        } catch (error) {
            retries++;
            console.log(error);
            console.log(`Error fetching data, retrying (${retries}/${maxRetries})...`);
        }
    }

    let tarsumy = completion.data.choices[0].message['content']
    console.log(tarsumy);
    res.json({"assistant": tarsumy});
});

module.exports.handler = serverless(app);

// app.listen(3000)
