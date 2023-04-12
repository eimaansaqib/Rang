import React from 'react';

interface Props {
  messages: string[];
}

function Messages({ messages }: Props) {
  return (
    <div className="right-side-container messages-container">
      <h1>Messages</h1>
      <div className="message-box">
        {messages.map((message) => (
          <div
            className="message-content-container"
            key={messages.indexOf(message)}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Messages;
