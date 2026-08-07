import {Button, Col, Input, Row, Typography} from "antd";
import {SectionDescription, SectionDescriptionTran, SectionIcon} from "../../../constants/constants";
import React from "react";
import {CloseCircleOutlined} from "@ant-design/icons";
const { Text } = Typography;
const ExampleSection = ({ contentData, onChange, onRemove, listeners, attributes}) => {
  const content = contentData.content;
  const handleChange = (newContent) => {
    onChange({ ...contentData, content: newContent });
  };

  const handleRemove = () => {
      onRemove();
  }
  const IconComponent = SectionIcon[contentData.subSectionType];

  return (
    <div style={{ backgroundColor: "white", padding: "5px" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Row align="middle" {...listeners} {...attributes} style={{ cursor: "grab" }}>
            <IconComponent />
            <Text style={{ marginLeft: 8 }} className={`subsection-title`}>{SectionDescriptionTran[contentData.subSectionType]}</Text>
            <div className="hint-text" style={{ marginLeft: 8 }}>
              {SectionDescription[contentData.subSectionType]}
            </div>
          </Row>
        </Col>
        <Col>
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            onClick={handleRemove}
          />
        </Col>
      </Row>
      <div style={{ textAlign: "left" }} className={`user-input-text`}>Input:</div>
      <Input.TextArea
        value={content.input}
        onChange={(e) => handleChange({ ...content, input: e.target.value })}
        autoSize={{
          minRows: 1,
        }}
      />
      <div style={{ textAlign: "left", paddingTop: "10px" }} className={`user-input-text`}>Output:</div>
      <Input.TextArea
        value={content.output}
        onChange={(e) => handleChange({ ...content, output: e.target.value })}
        autoSize={{
          minRows: 1,
        }}
      />
    </div>
  );
};

export default ExampleSection;
