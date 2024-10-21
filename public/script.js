async function generateApp() {
  const userInput = document.getElementById('userInput').value;
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = 'Generating your application... Please wait.';

  const response = await fetch('/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userInput })
  });

  if (response.ok) {
    const data = await response.json();
    outputDiv.innerHTML = `<h2>Your Application:</h2><pre>${data.output}</pre>`;
  } else {
    outputDiv.innerHTML = 'An error occurred while generating the application.';
  }
}