import RefDataComponent from "./ConfigData";
import RefParamComponent from "./ConfigParam";
import RefAPIComponent from "./ConfigAPI";
import { RightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Button } from "antd";
import {useDispatchGlobalState, useGlobalStateSelector} from "../../../../hooks/global.ts";



const ConfigVariableComponent = () => {
    const { selectedVariable } = useGlobalStateSelector((state) => state.global);
  const { changeIsVariableShow } = useDispatchGlobalState();
  const [titleInfo, setTitleInfo] = useState('');

  useEffect(() => {
      if (selectedVariable.type === 'ref-data') {
          setTitleInfo("选择智能体参数作为知识库查询依据");
      } else if (selectedVariable.type === 'ref-api') {
          setTitleInfo("配置插件");
      } else if (selectedVariable.type === 'ref-param') {
          setTitleInfo(`配置智能体参数`);
      }
  }, [selectedVariable]); // 添加 selectedVariable 为依赖项

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid hsl(214.3 31.8% 91.4%)' }}>
        <Button onClick={changeIsVariableShow} icon={<RightOutlined />} type="text" />
        <div>{titleInfo}</div>
      </div>
      {selectedVariable.type === 'ref-data' && <RefDataComponent />}
      {selectedVariable.type === 'ref-api' && <RefAPIComponent />}
      {selectedVariable.type === 'ref-param' && <RefParamComponent />}
    </>
  );
};

export default ConfigVariableComponent;
