import React, { useState } from 'react';
import { Modal, Input } from 'antd';

const SetKeyComponent = ({ isModalVisible, onApiKeyChange, onCancel, initialApiKey }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);

  const handleApiKeyChange = () => {
    onApiKeyChange(apiKey);
  };

  return (
    <Modal
      title="Set API Key"
      open={isModalVisible}
      onOk={handleApiKeyChange}
      onCancel={onCancel}
    >
      <p>Enter your OpenAI API Key:<br/>You can change your openai key in Setting</p>
      <Input
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
    </Modal>
  );
};

export default SetKeyComponent;
