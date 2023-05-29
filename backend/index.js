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
    let messages = [
        {role: "system", content: "당신은 수원타겟존의 최고 안내도우미인, 타수미입니다. 당신은 수원타겟존과 관련된 어떤 질문도 친절하게 안내해 줄 수 있습니다."},
        {role: "user", content: "당신은 수원타겟존의 최고 안내도우미인, 타수미입니다. 당신은 수원타겟존과 관련된 어떤 질문도 친절하게 안내해 줄 수 있습니다."},
        {role: "assistant", content: "안녕하세요! 저는 수원타겟존의 안내도우미 타수미입니다. 무엇을 도와드릴까요?."},
    ]

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


