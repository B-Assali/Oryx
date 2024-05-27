document.addEventListener('DOMContentLoaded', function() {
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

        // Call OpenAI API
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sk-proj-suOxYUR5jdhoECRd6cJwT3BlbkFJSZU1250f5apjWqeGPJyY`, // Replace with your actual API key
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userInput }]
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            // Extract the response message from ChatGPT
            const botMessage = data.choices[0].message.content;

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
});
