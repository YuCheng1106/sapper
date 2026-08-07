import {
    Button, Space, Splitter,
} from 'antd';
import {LeftOutlined, SaveOutlined} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import {useDispatchPlugin, usePluginSelector} from "../../hooks/plugin.ts";
import {useEffect, useState} from "react";
import {PluginDetail} from "../../types/pluginType.ts";
import {PluginFormComponent} from "../../components";
import {PageLoading} from "@ant-design/pro-components";


const PluginWorkspacePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatchPlugin();

    useEffect(() => {
        const lastPartOfPath = location.pathname.split("/").pop()
        if (lastPartOfPath)
            dispatch.getPluginDetail(lastPartOfPath);
    }, [location.pathname]);
    const pluginDetail = usePluginSelector((state) => state.plugin.pluginDetail)
    const [pluginData, setPluginData] = useState<PluginDetail | null>(null);

    useEffect(() => {
        setPluginData(pluginDetail)
    }, [pluginDetail]);

    const handlePluginChange = (value: PluginDetail) => {
        setPluginData({...pluginData, ...value});
    }

    const handlePluginUpdate = async () => {
        if(pluginData){
            await dispatch.updatePluginInfo(pluginData.uuid, pluginData)
        }
    }

    return (
        <div className="d-flex flex-column WorkPage" style={{position: "relative"}}>
            <div className={`d-flex justify-content-between align-items-center`}
                 style={{backgroundColor: 'white', padding: '5px', borderBottom: '1px solid hsl(214.3 31.8% 91.4%)'}}>
                <div>
                    <Space>
                        <Button icon={<LeftOutlined/>} onClick={() => navigate("/workspace/plugin")}>全部插件</Button>
                        <Space.Compact>
                            <Button onClick={handlePluginUpdate}  icon={<SaveOutlined/>}>
                                保存
                            </Button>
                        </Space.Compact>
                    </Space>
                </div>
            </div>
            <Splitter className={`flex-grow-1 overflow-hidden`} style={{}}>
                <Splitter.Panel defaultSize="100%" min="100%" max="100%"
                                style={{overflow: "auto", padding: "20px", justifyContent: 'center', display: 'flex'}}>
                    {pluginData ?
                        <div style={{maxWidth: '800px', width: '100%', padding: '10px'}}>
                            <PluginFormComponent plugin_data={pluginData} handleChange={handlePluginChange}/>
                        </div>
                         :
                        <PageLoading/>
                    }
                </Splitter.Panel>
            </Splitter>
        </div>
    )
};

export default PluginWorkspacePage;
