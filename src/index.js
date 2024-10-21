const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Helper function to validate API key
function validateApiKey(apiKey) {
  return apiKey && apiKey.length > 0;
}

// Helper function to execute CLI commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

app.post('/generate', async (req, res) => {
  const { apiKey, baseUrl, modelProvider, userInput } = req.body;

  if (!validateApiKey(apiKey)) {
    return res.status(400).json({ error: 'Invalid API key' });
  }

  try {
    const taskDescription = await generateTaskDescription(userInput, modelProvider, apiKey, baseUrl);
    const { output, conversation } = await generateApp(userInput, modelProvider, apiKey, baseUrl);
    res.json({ taskDescription, output, conversation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while generating the app.' });
  }
});

async function generateTaskDescription(userInput, modelProvider, apiKey, baseUrl) {
  const prompt = `Generate a task description for building an application based on this input: "${userInput}"`;
  const response = await makeApiCall(modelProvider, apiKey, baseUrl, prompt);
  return response.trim();
}

async function generateApp(userInput, modelProvider, apiKey, baseUrl) {
  let conversation = [];
  let output = '';

  conversation.push({ role: 'System', content: 'Initiating app generation process.' });

  // Simulating multi-agent conversation
  const agents = ['Architect', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Tester'];
  for (const agent of agents) {
    const prompt = `As a ${agent}, what's your input on building an app described as: "${userInput}"`;
    const response = await makeApiCall(modelProvider, apiKey, baseUrl, prompt);
    conversation.push({ role: agent, content: response.trim() });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate time passing
  }

  // Generate actual app structure and code
  const appGenerationPrompt = `Generate a basic structure and code for an app described as: "${userInput}". Include steps for setup and running the project.`;
  output = await makeApiCall(modelProvider, apiKey, baseUrl, appGenerationPrompt);

  // Simulate CLI commands (replace with actual commands if needed)
  try {
    await executeCommand('echo "Setting up project structure"');
    await executeCommand('echo "Installing dependencies"');
    await executeCommand('echo "Running tests"');
  } catch (error) {
    conversation.push({ role: 'System', content: `CLI Error: ${error}` });
  }

  conversation.push({ role: 'System', content: 'App generation complete.' });

  return { output, conversation };
}

async function makeApiCall(modelProvider, apiKey, baseUrl, prompt) {
  let apiEndpoint, requestBody, headers;

  switch (modelProvider) {
    case 'openai':
      apiEndpoint = `${baseUrl}/v1/chat/completions`;
      requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      };
      headers = { 'Authorization': `Bearer ${apiKey}` };
      break;
    case 'anthropic':
      apiEndpoint = `${baseUrl}/v1/complete`;
      requestBody = {
        prompt: `Human: ${prompt}\n\nAssistant:`,
        model: "claude-2",
        max_tokens_to_sample: 1000
      };
      headers = { 'X-API-Key': apiKey };
      break;
    case 'gemini':
      apiEndpoint = `${baseUrl}/v1beta/models/gemini-pro:generateContent`;
      requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      headers = { 'x-goog-api-key': apiKey };
      break;
    default:
      throw new Error('Unsupported model provider');
  }

  const response = await axios.post(apiEndpoint, requestBody, { headers });
  
  // Extract the generated text based on the provider's response structure
  let generatedText;
  if (modelProvider === 'openai') {
    generatedText = response.data.choices[0].message.content;
  } else if (modelProvider === 'anthropic') {
    generatedText = response.data.completion;
  } else if (modelProvider === 'gemini') {
    generatedText = response.data.candidates[0].content.parts[0].text;
  }

  return generatedText;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});