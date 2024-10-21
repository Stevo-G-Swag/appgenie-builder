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
    
    await displayConversationRealTime(conversation);
    
    updateProgress(100);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('output').innerHTML = `Error: ${error.response?.data?.error || error.message}`;
  }
}

function updateProgress(percentage) {
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = `${percentage}%`;
}

async function displayConversationRealTime(conversation) {
  const conversationLog = document.getElementById('conversationLog');
  conversationLog.innerHTML = '';
  
  for (const message of conversation) {
    const messageElement = document.createElement('div');
    messageElement.className = 'mb-2';
    messageElement.innerHTML = `<strong>${message.role}:</strong> ${message.content}`;
    conversationLog.appendChild(messageElement);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate real-time updates
    updateProgress((conversationLog.children.length / conversation.length) * 100);
  }
}

function approveAction() {
  document.getElementById('humanApproval').classList.add('hidden');
  // Implement the logic to continue with the approved action
  console.log("Action approved");
}

function rejectAction() {
  document.getElementById('humanApproval').classList.add('hidden');
  // Implement the logic to handle the rejected action
  console.log("Action rejected");
}

function requestHumanApproval(action) {
  document.getElementById('humanApproval').classList.remove('hidden');
  document.getElementById('approvalRequest').textContent = `Approve action: ${action}`;
}

// Example usage of human approval
// document.getElementById('someActionButton').addEventListener('click', () => {
//   requestHumanApproval('Install new dependency');
// });