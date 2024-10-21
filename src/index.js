const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const API_KEY = process.env.LLM_API_KEY; // Use environment variable for API key

app.post('/generate', async (req, res) => {
  const userInput = req.body.userInput;

  // Construct the prompt for the LLM
  const prompt = `
You are a coding assistant that helps users build complete applications based on their descriptions.
Generate code for a project that meets the following description:
"${userInput}"
Provide step-by-step instructions for setting up and running the project.
`;

  try {
    // Make a request to the LLM API
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: prompt,
        max_tokens: 1500,
        temperature: 0.7,
        n: 1,
        stop: null,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    const generatedText = response.data.choices[0].text;

    res.send({ output: generatedText });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating the app.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});