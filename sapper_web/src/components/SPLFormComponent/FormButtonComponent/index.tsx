import { Button, Menu, Dropdown } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import {InitSectionValue, SectionDescriptionTran} from "../../../constants/constants";

const FormButtonComponent = ({ onChange }) => {
  const addAnnotation = (type) => () => {
    const componentType = InitSectionValue.find((component) => component.type === type);
    if (componentType) {
      // 调用 initialState 函数获取初始状态
      const initialState = componentType.initialState();
      onChange(initialState);
    }
  };

  const menu = (
    <Menu>
      {InitSectionValue.map((component) => (
        <Menu.Item key={component.type} onClick={addAnnotation(component.type)}>
          {SectionDescriptionTran[component.type]}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div style={{ textAlign: 'right', marginTop: "10px", marginBottom: "10px"}}>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button icon={<PlusOutlined />}>
           添加模块
        </Button>
      </Dropdown>
    </div>
  );
};

export default FormButtonComponent;
