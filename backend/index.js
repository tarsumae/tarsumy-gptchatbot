// const serverless = require('serverless-http');
const fs = require('fs');
const path = require('path');
const express = require('express');
var cors = require('cors');
const app = express();
const PORT = 8080;
const apiKey = process.env.OPENAI_API_KEY;
const { Configuration, OpenAIApi } = require("openai");

// setup OpenAI configuration
const configuration = new Configuration({apiKey: apiKey});
const openai = new OpenAIApi(configuration);

// read system.txt file
const systemMessage = fs.readFileSync('system.txt', 'utf-8'); // replace 'frontend' with your actual directory name

let corsOptions = {
    origin: 'https://web-tarsumy-gptchatbot-7e6o2cli1ltald.sel4.cloudtype.app',
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions), function(req, res, next) {
  console.log("CORS passed");
  next();
});

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// POST method route
app.post('/tarsymy', async function (req, res) {
    let userMessages = req.body.userMessages;
    let assistantMessages = req.body.assistantMessages;

    // construct messages array based on user and assistant messages
    let messages = [];
    for (let i = 0; i < userMessages.length; i++) {
        messages.push({role: "user", content: userMessages[i]});
        if (assistantMessages[i]) {
            messages.push({role: "assistant", content: assistantMessages[i]});
        }
    }

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
                // frequency_penalty: 0.3,
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
    res.json({"assistant": tarsumy});
});

// express로 웹 서버 시작
app.listen(PORT, function() {
  console.log("Listening on port" + PORT);
});

app.use(function (err, req, res, next) {
   console.error(err.stack)
   res.status(500).send('Something broke!')
})

//module.exports.handler = serverless(app);
// app.listen(5500, () => {
//     console.log('Server is running on port 5500');
// });


