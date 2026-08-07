// AgentPromptModal.js
import React from 'react';
import { Modal, Tooltip } from 'antd';
import {handleCopyToClipboard} from "../../utils/tool.ts";

const AgentPromptModal = ({ visible, handleModalVisibility, spl}) => {
  return (
    <Modal
      title="智能体提示"
      width={'90%'}
      open={visible}
      onOk={() => handleModalVisibility('agentprompt', false)}
      onCancel={() => handleModalVisibility('agentprompt', false)}
    >
      <div>
        <div>提示
          <Tooltip placement="rightTop" title={"copy prompt"}>
            <i className="fa fa-clone Icon" onClick={() => handleCopyToClipboard(spl)}>
            </i>
          </Tooltip>
        </div>
        <div style={{ minHeight: '90%', overflowY: "auto" }}>
          <div className={`d-flex justify-content-between`}>
            <pre style={{ lineHeight: '1.1', overflowY: 'hidden' }}>
              <br />{spl}</pre>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AgentPromptModal;
