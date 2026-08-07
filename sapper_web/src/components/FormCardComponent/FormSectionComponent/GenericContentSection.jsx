import React, { useState } from "react";
import {Row, Col, Typography, Button, message} from "antd";
import {SectionDescription, SectionDescriptionTran, SectionIcon} from "../../../constants/constants";
import { CloseCircleOutlined, SettingOutlined} from '@ant-design/icons';
import RefInput from "./RefInput.js";
import MagicWandIcon from "../../Icons/MagicWandOutlined";
const { Text } = Typography;

const GenericContentSection = ({ contentData, onChange, onRemove, active, listeners, attributes}) => {
  const [text, setText] = useState(contentData.content);

  const handleChange = (newText) => {
    setText(newText);
    onChange({ ...contentData, content: newText });
  };

  const IconComponent = SectionIcon[contentData.subSectionType];

  return (
    <div style={{ backgroundColor: "white", width: '100%'}}>
      <Row justify="space-between" align="middle">
        <Col>
          <Row align="middle" {...listeners} {...attributes} style={{ cursor: "grab" }}>
            {active && <IconComponent/>}
            <Text className={`subsection-title`} style={{ marginLeft: 8 }}>
              {SectionDescriptionTran[contentData.subSectionType]}
            </Text>
            <div className="hint-text" style={{ marginLeft: 8 }}>
              {SectionDescription[contentData.subSectionType]}
            </div>
          </Row>
        </Col>
        <Col>
          {/*  魔法棒的图标*/}
          <Button
              type="text"
              icon={<MagicWandIcon />}  // 使用自定义图标
              onClick={() => message.info("魔法棒功能即将推出！")}
              style={{ marginRight: 8 }}
          />
          <Button
              type="text"
              icon={<CloseCircleOutlined/>}
              onClick={onRemove}
          />
        </Col>
      </Row>
      <RefInput value={text} onChange={(e) => handleChange(e)} active={active}/>
    </div>
  );
};

export default GenericContentSection;
