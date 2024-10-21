let currentStep = 0;
const totalSteps = 5;
let devConversationLog = [];

async function generateApp() {
  const apiKey = document.getElementById('apiKey').value;
  const baseUrl = document.getElementById('baseUrl').value;
  const modelProvider = document.getElementById('modelProvider').value;
  const userInput = document.getElementById('userInput').value;
  
  document.getElementById('taskDescription').classList.remove('hidden');
  document.getElementById('progressBar').classList.remove('hidden');
  document.getElementById('output').classList.remove('hidden');
  document.getElementById('devConversation').classList.remove('hidden');
  
  updateProgress(0);
  
  try {
    const response = await axios.post('/generate', {
      apiKey,
      baseUrl,
      modelProvider,
      userInput
    });
    
    const { taskDescription, output, conversation } = response.data;
    
    document.getElementById('taskDescription').innerHTML = `<h3 class="font-bold mb-2">Task Description:</h3>${taskDescription}`;
    document.getElementById('output').innerHTML = `<h3 class="font-bold mb-2">Generated Output:</h3><pre>${output}</pre>`;
    
    displayConversation(conversation);
    
    updateProgress(100);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('output').innerHTML = 'An error occurred while generating the application.';
  }
}

function updateProgress(percentage) {
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = `${percentage}%`;
}

function displayConversation(conversation) {
  const conversationLog = document.getElementById('conversationLog');
  conversationLog.innerHTML = '';
  
  conversation.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = 'mb-2';
    messageElement.innerHTML = `<strong>${message.role}:</strong> ${message.content}`;
    conversationLog.appendChild(messageElement);
  });
}

function approveAction() {
  // Implement approval logic
  document.getElementById('humanApproval').classList.add('hidden');
  // Continue with the approved action
}

function rejectAction() {
  // Implement rejection logic
  document.getElementById('humanApproval').classList.add('hidden');
  // Handle the rejected action
}

// Simulated function to request human approval
function requestHumanApproval(action) {
  document.getElementById('humanApproval').classList.remove('hidden');
  document.getElementById('approvalRequest').textContent = `Approve action: ${action}`;
}

// Example usage: requestHumanApproval('Install new dependency');