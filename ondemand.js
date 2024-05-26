<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Application</title>
    <style>
        .message-container {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user-message {
            text-align: right;
            color: blue;
        }
        .bot-reply {
            text-align: left;
            color: green;
        }
    </style>
</head>
<body>
    <div class="message-container">
        <div class="message-display"></div>
    </div>
    <input type="text" class="chat-input" placeholder="Type a message...">
    <button class="send-button">Send</button>
    <button class="reset-button">Reset</button>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            let sessionId = null; // Global variable to store the session ID
            
            // Function to create a new chat session
            function createChatSession() {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("apikey", "pZ1FjP5i9u5xmmH8BLwdEcSJ7tpBANuG");

                const raw = JSON.stringify({
                    "pluginIds": [],
                    "externalUserId": "1234"
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch("https://gateway-dev.on-demand.io/chat/v1/sessions", requestOptions)
                    .then((response) => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then((result) => {
                        console.log('Chat Session Created:', result); // Log the response
                        sessionId = result.chatSession.id; // Store the session ID
                        console.log('Session ID:', sessionId); // Log the session ID
                    })
                    .catch((error) => {
                        console.error('Error creating chat session:', error); // Log the error
                    });
            }

            // Create a chat session when the page loads
            createChatSession().then(() => {
                document.querySelector('.send-button').addEventListener('click', function() {
                    // Get the user input
                    const userInput = document.querySelector('.chat-input').value;

                    // Make sure there's input to send
                    if (!userInput) {
                        alert('Please enter a message.');
                        return;
                    }

                    // Create new HTML elements for user input and bot reply
                    const messageDisplay = document.querySelector('.message-display');
                    const userMessageDiv = document.createElement('div');
                    const botReplyDiv = document.createElement('div');

                    // Set classes for the new elements
                    userMessageDiv.classList.add('user-message');
                    botReplyDiv.classList.add('bot-reply');

                    // Set content for the new elements
                    userMessageDiv.textContent = userInput;

                    // Append the new elements to the message display area
                    messageDisplay.appendChild(userMessageDiv);

                    // Clear the input field after displaying the message
                    document.querySelector('.chat-input').value = '';

                    // Scroll to the bottom of the message container
                    const messageContainer = document.querySelector('.message-container');
                    messageContainer.scrollTop = messageContainer.scrollHeight;

                    // Ensure sessionId is available before sending the query
                    if (!sessionId) {
                        console.error('Session ID is not available.');
                        botReplyDiv.textContent = 'Sorry, there was an error processing your request.';
                        messageDisplay.appendChild(botReplyDiv);
                        return;
                    }

                    // Step 2: Answer Query API
                    const myHeaders = new Headers();
                    myHeaders.append("apikey", "pZ1FjP5i9u5xmmH8BLwdEcSJ7tpBANuG");
                    myHeaders.append("Content-Type", "application/json");

                    const raw = JSON.stringify({
                        "endpointId": "predefined-openai-gpt4o",
                        "query": userInput,
                        "pluginIds": [
                            "plugin-1716030024"
                        ],
                        "responseMode": "sync"
                    });

                    const requestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: raw,
                        redirect: "follow"
                    };

                    fetch(`https://gateway-dev.on-demand.io/chat/v1/sessions/${sessionId}/query`, requestOptions)
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Query Response:', data); // Log the response

                        // Extract the response message from the API
                        const botMessage = data.chatMessage && data.chatMessage.answer;

                        if (!botMessage) {
                            throw new Error('No response message received from the API');
                        }

                        // Set content for the bot reply element
                        botReplyDiv.textContent = botMessage;

                        // Append the bot reply to the message display area
                        messageDisplay.appendChild(botReplyDiv);

                        // Scroll to the bottom of the message container again to show the new message
                        messageContainer.scrollTop = messageContainer.scrollHeight;
                    })
                    .catch(error => {
                        console.error('Error:', error); // Log the error to the console for debugging
                        botReplyDiv.textContent = 'Sorry, there was an error processing your request.';
                        messageDisplay.appendChild(botReplyDiv);
                    });
                });

                // Add event listener for the reset button to clear messages and create a new session
                document.querySelector('.reset-button').addEventListener('click', function() {
                    const messageDisplay = document.querySelector('.message-display');
                    messageDisplay.innerHTML = ''; // Clear all messages
                    createChatSession(); // Create a new chat session
                });
            }).catch(error => {
                console.error('Error during session creation:', error);
            });
        });
    </script>
</body>
</html>
