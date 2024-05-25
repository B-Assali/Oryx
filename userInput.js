document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.send-button').addEventListener('click', function() {
        // Get the user input
        const userInput = document.querySelector('.chat-input').value;

        // Make sure there's input to send
        if (!userInput) {
            alert('Please enter a message.');
            return;
        }

        /*const youMessageDisplay = document.querySelector('.you-message');
        youMessageDisplay.innerHTML = 'You';*/

        
        // Create new HTML elements for user input and bot reply
        const messageDisplay = document.querySelector('.message-display');
        const userMessageDiv = document.createElement('div');
        const botReplyDiv = document.createElement('div');

        // Set classes for the new elements
        userMessageDiv.classList.add('user-message');
        botReplyDiv.classList.add('bot-reply');

        // -------> THIS NEEDS TO BE CHANGED!!!!!
        const botResponse = "The oil production rate of year 2040 is 3405 billion gallons"; 

        // Set content for the new elements
        userMessageDiv.textContent = userInput;
        botReplyDiv.textContent = botResponse;

        // Append the new elements to the message display area
        messageDisplay.appendChild(userMessageDiv);
        messageDisplay.appendChild(botReplyDiv);

        // Clear the input field after displaying the message
        document.querySelector('.chat-input').value = '';
        // Scroll to the bottom of the message container
        const messageContainer = document.querySelector('.message-container');
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
});
