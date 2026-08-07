import {useState} from 'react';
import {
    Modal,
    Button,
} from 'antd';
import {PluginFormComponent} from "../../components";
import {PluginDetail, PluginCreateReq} from "../../types/pluginType.ts";

interface PluginCreateModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (plugin: PluginCreateReq) => void;
}

const PluginCreateModal = ({open, onClose, onCreate}: PluginCreateModalProps) => {
    const [newPlugin, setNewPlugin] = useState<PluginDetail | null>(null);


    const handlePluginChange = (value: PluginDetail) => {
        console.log(value)
        setNewPlugin(value);
    }

    const handleOk = async () => {
        if(newPlugin) {
            onCreate(newPlugin);
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal width='90%' title={`导入插件`} open={open} onCancel={onClose}
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
            <div style={{height:'75vh', overflowY: 'auto', padding: '10px'}}>
                <PluginFormComponent handleChange={handlePluginChange}/>
            </div>
        </Modal>
    );
};

export default PluginCreateModal;
