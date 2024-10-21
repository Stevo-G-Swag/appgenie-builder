import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import axios from 'axios';

const LLMAppBuilder = () => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [modelProvider, setModelProvider] = useState('openai');
  const [userInput, setUserInput] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [output, setOutput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [progress, setProgress] = useState(0);

  const generateApp = async () => {
    try {
      setProgress(0);
      setTaskDescription('');
      setOutput('');
      setConversation([]);

      const response = await axios.post('/generate', {
        apiKey,
        baseUrl,
        modelProvider,
        userInput
      });

      const { taskDescription, output, conversation } = response.data;
      setTaskDescription(taskDescription);
      setOutput(output);
      await displayConversationRealTime(conversation);
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      setOutput(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const displayConversationRealTime = async (conv) => {
    for (let i = 0; i < conv.length; i++) {
      setConversation(prev => [...prev, conv[i]]);
      setProgress((i + 1) / conv.length * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">LLM App Builder</h1>
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        <Select value={modelProvider} onValueChange={setModelProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select Model Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="gemini">Google Gemini</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Describe the application you want to build"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button onClick={generateApp}>Generate App</Button>
      </div>
      {progress > 0 && <Progress value={progress} className="mt-4" />}
      {taskDescription && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Task Description</h2>
          <p>{taskDescription}</p>
        </div>
      )}
      {conversation.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Development Conversation</h2>
          {conversation.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>{msg.role}:</strong> {msg.content}
            </div>
          ))}
        </div>
      )}
      {output && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Generated Output</h2>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default LLMAppBuilder;