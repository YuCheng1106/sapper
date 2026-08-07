import { Tooltip, Tag } from "antd";
import { useAgentSelector } from "../../../../hooks/agent";
import { usePluginSelector } from "../../../../hooks/plugin";
import { useDispatchGlobalState } from "../../../../hooks/global";
import { RefActionProps } from "./index.tsx";

interface APIParams {
    uuid: string | null;
    inputParams: Record<string, string>;
    outputParam: string | null;
}

/**
 * 解析API引用字符串
 * @param text API引用字符串，格式如：~refAPI{uuid}[input][output]/refAPI
 * @returns 包含uuid、输入参数和输出参数的对象
 */
const parseAPIReference = (text: string): APIParams => {
    // 匹配完整的API引用格式
    const apiRegex = /^~refAPI\{(.*?)\}\[(.*?)\]\[(.*?)\]\/refAPI$/;
    const match = text.match(apiRegex);

    if (!match) {
        return {
            uuid: null,
            inputParams: {},
            outputParam: null
        };
    }

    const [, uuid, inputStr, outputStr] = match;

    let inputParams = {};
    let outputParam: string | null = null;

    try {
        // 解析输入参数
        if (inputStr.trim()) {
            inputParams = JSON.parse(inputStr);
        }

        // 解析输出参数（去除${和}$）
        if (outputStr.startsWith("${") && outputStr.endsWith("}$")) {
            outputParam = outputStr.slice(2, -2);
        }
    } catch (error) {
        console.error('解析API参数失败:', error);
    }

    return {
        uuid,
        inputParams,
        outputParam
    };
};
const tagStyle = {cursor: "pointer", fontWeight: 'bold', transition: 'all 0.3s'};
const RenderRefAPI = (props: RefActionProps) => {
    const { text } = props;
    const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
    const plugins = usePluginSelector((state) => state.plugin.plugins);
    const publicPlugins = usePluginSelector((state) => state.plugin.publicPlugins);
    const { changeSelectedVariable } = useDispatchGlobalState();

    // 解析API引用
    const { uuid, inputParams, outputParam } = parseAPIReference(text);

    const handleAPIClick = () => {
        changeSelectedVariable({ type: 'ref-api', data: text });
    };
    const allPlugins = [...plugins.items, ...publicPlugins.items];
    const uniquePlugins = allPlugins.filter((plugin, index, array) =>
        array.findIndex(p => p.uuid === plugin.uuid) === index
    );
    // 查找相关插件信息
    const selectedPlugin = uniquePlugins.find((plugin) => plugin.uuid === uuid);
    const associatePlugin = agentDetail?.plugins.find((plugin) => plugin.uuid === uuid);

    // 渲染提示标签
    const renderErrorTag = (tooltipMessage:string, label: string) => (
        <Tooltip title={tooltipMessage} mouseEnterDelay={0.3} mouseLeaveDelay={0.1}>
            <Tag color="red" style={tagStyle}>
                {label}
            </Tag>
        </Tooltip>
    );

    // 渲染提示标签
    const renderWarnTag = (tooltipMessage:string, label: string) => (
        <Tooltip title={tooltipMessage} mouseEnterDelay={0.3} mouseLeaveDelay={0.1}>
            <Tag color="orange" style={tagStyle} onClick={handleAPIClick}>
                {label}
            </Tag>
        </Tooltip>
    );

    // 错误状态渲染
    if (!uuid) {
        return renderErrorTag("未选择插件！", text);
    }

    if (!selectedPlugin) {
        return renderErrorTag("该插件不存在！", text);
    }

    if (!associatePlugin) {
        return renderErrorTag("该插件未被关联！", text);
    }

    if (!outputParam) {
        return renderWarnTag("参数设置错误！", `~refAPI{${selectedPlugin.name}}`);
    }

    // 正常状态渲染
    return (
        <Tooltip
            title={
                <div>
                    <div>输入参数: {JSON.stringify(inputParams)}</div>
                    <div>输出参数: {outputParam}</div>
                </div>
            }
        >
            <Tag
                color="purple"
                onClick={handleAPIClick}
                style={{
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                }}
            >
                {`~refAPI{${selectedPlugin.name}}`}
            </Tag>
        </Tooltip>
    );
};

export default RenderRefAPI;