import {useEffect, useState} from 'react';
import {
    Modal,
    Button,
} from 'antd';
import PluginFormComponent from "../../components/PluginFormComponent";
import {useDispatchPlugin, usePluginSelector} from "../../hooks/plugin";
import {PluginDetail} from "../../types/pluginType.ts";
import {PageLoading} from "@ant-design/pro-components";


const PluginEditModal = ({plugin_uuid, open, onCancel}: {plugin_uuid: string, open: boolean, onCancel: () => void}) => {
  const dispatch = useDispatchPlugin();

  const [pluginData, setPluginData] = useState<PluginDetail | null>(null);
  useEffect(() => {
    dispatch.getPluginDetail(plugin_uuid);
  }, [plugin_uuid]);
  const pluginDetail = usePluginSelector((state) => state.plugin.pluginDetail);
  useEffect(() => {
    setPluginData(pluginDetail)
  }, [pluginDetail]);
  const handlePluginChange = (value: PluginDetail) => {
      setPluginData(value);
  }

  const handleOk = async () => {
    if(pluginData){
        dispatch.updatePluginInfo(plugin_uuid, pluginData)
    }
      onCancel()
  };

  const handleCancel = () => {
      onCancel()
  };

  return (
      <Modal width='90%' title={`更新插件`} open={open} onCancel={handleCancel}
      footer={[
          <Button type="primary" onClick={() => handleOk()}>
              确定
          </Button>,
          <Button
            onClick={handleCancel}
          >
            取消
          </Button>,
        ]}
      >
          {pluginData ? <PluginFormComponent plugin_data={pluginData} handleChange={handlePluginChange}/> :
            <PageLoading/>
          }
      </Modal>
  );
};

export default PluginEditModal;
