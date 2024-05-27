

document.addEventListener('DOMContentLoaded', function() {
    let sessionId = null; // Global variable to store the session ID
    
    // List of common questions related to oil production data
    const commonQuestions = [
      "What was the oil production amount in the UAE in 2002?",
      "What was the oil consumption in the UAE in 2002?",
      "What were the oil imports to the UAE in 2002?",
      "What were the oil exports from the UAE in 2002?",
      "What was the population total in the UAE in 2002?",
      "What was the immigration rate in the UAE in 2002?",
      "What was the GDP per capita in the UAE in 2002?",
      "What was the gross CO2 production in the UAE in 2002?",
      "How many crude oil rigs were there in the UAE in 2002?",
      "What was the CO2 emitted per year from oil extractions in the UAE in 2002?",
      "What was the CO2 emitted per year from oil extractions around the world in 2002?",
      "What was the yearly energy generation in the UAE in 2002?",
      "What was the average energy consumption per capita in the UAE in 2002?",
      "What was the annual change in primary energy consumption in the UAE in 2002?",
      "What were the oil reserves in the UAE in 2002?",
      "What is the predicted oil demand in the UAE in 2030?"
    ];

    // Units for specific factors
    const unitsMap = {
        "oil production": "thousand barrels per day",
        "oil consumption": "terawatt-hours (TWh)",
        "imports": "barrels per day",
        "exports": "million barrels per day",
        "population": "number of people",
        "immigration": "number of people",
        "GDP per capita": "$",
        "CO2 production": "tonnes",
        "oil rigs": "",
        "CO2 emitted per year from oil extractions around the world": "tonnes",
        "CO2 emitted per year from oil extractions in the UAE": "tonnes",
        "yearly energy generation": "terawatt-hours (TWh)",
        "average energy consumption per capita": "kilowatt-hours (kWh)",
        "annual change in primary energy consumption": "%",
        "oil reserves": "billion tonnes"
    };

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

    // Function to update autocomplete suggestions
    function updateAutocompleteSuggestions(input) {
        const suggestionsContainer = document.querySelector('.autocomplete-suggestions');
        suggestionsContainer.innerHTML = ''; // Clear existing suggestions

        if (!input) return;

        const filteredQuestions = commonQuestions.filter(question =>
            question.toLowerCase().includes(input.toLowerCase())
        );

        filteredQuestions.forEach(question => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('autocomplete-suggestion');
            suggestionDiv.textContent = question;
            suggestionDiv.addEventListener('click', () => {
                document.querySelector('.chat-input').value = question;
                suggestionsContainer.innerHTML = ''; // Clear suggestions after selecting
            });
            suggestionsContainer.appendChild(suggestionDiv);
        });
    }

    // Function to send a message
    function sendMessage() {
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
                console.log('Query Response:', data); // Log the full response

                // Extract the response message from the API
                const botMessage = data.chatMessage && data.chatMessage.answer;

                if (!botMessage) {
                    throw new Error('No response message received from the API');
                }

                // Find the unit for the query, if any
                const queryFactor = Object.keys(unitsMap).find(factor =>
                    userInput.toLowerCase().includes(factor.toLowerCase())
                );

                const units = unitsMap[queryFactor] || '';

                // Set content for the bot reply element
                botReplyDiv.textContent = botMessage + (units ? ` (${units})` : '');

                // Append the bot reply to the message display area
                messageDisplay.appendChild(botReplyDiv);

                // Scroll to the bottom of the message container again to show the new message
                messageContainer.scrollTop = messageContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error); // Log the error to the console for debugging
                botReplyDiv.textContent = 'Sorry, there was an error processing your request.';
                messageDisplay.appendChild(botReplyDiv);

                // Scroll to the bottom of the message container to show the error message
                messageContainer.scrollTop = messageContainer.scrollHeight;
            });
    }

    // Create a chat session when the page loads
    createChatSession().then(() => {
        const sendButton = document.querySelector('.send-button');
        const chatInput = document.querySelector('.chat-input');

        // Add event listener for the send button
        sendButton.addEventListener('click', sendMessage);

        // Add event listener for the Enter key
        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default behavior of newline
                sendMessage();
            }
        });

        // Add event listener for the reset button to clear messages
        document.querySelector('.reset-button').addEventListener('click', function() {
            const messageDisplay = document.querySelector('.message-display');
            messageDisplay.innerHTML = ''; // Clear all messages
            createChatSession(); // Create a new chat session
        });

        // Add event listener for input changes to show autocomplete suggestions
        chatInput.addEventListener('input', function(event) {
            updateAutocompleteSuggestions(event.target.value);
        });
    }).catch(error => {
        console.error('Error during session creation:', error);
    });
});
