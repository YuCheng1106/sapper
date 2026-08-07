import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {message } from 'antd';
import { useAgentSelector, useDispatchAgent } from "../../hooks/agent";
import { useConversationSelector, useDispatchConversation } from "../../hooks/conversation";
import EmulatorComponent from "../../components/EmulatorComponent";
import {AgentDisplayHeader, AgentDisplaySidebar} from "../../components";
import {useDispatchUser, useUserSelector} from "../../hooks/user.ts";

const AgentDisplayPage = () => {
    const agentDispatch = useDispatchAgent();
    const userDispatch = useDispatchUser();
    const dispatchConversation = useDispatchConversation();

    const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
    const userDetail = useUserSelector((state) => state.user.user);
    const conversationDetail = useConversationSelector((state) => state.conversation.conversationDetail);
    const query = useConversationSelector((state) => state.conversation.query);
    const conversations = useConversationSelector((state) => state.conversation.conversations);

    const agentStatus = useAgentSelector((state) => state.agent.status);
    const conversationStatus = useConversationSelector((state) => state.conversation.status);

    const location = useLocation();
    const navigate = useNavigate();
    const [selectedConversationId, setSelectedConversationId] = useState<string>("-1")
    const isNewConversation = useConversationSelector((state) => state.conversation.isNewConversation)
    const cozeLightBg = 'bg-[#FAF9FF]';
    const cozeBorder = 'border-[#EAE5FF]';
    const agentLoading= ! ["succeeded", 'failed', 'idle'].includes(agentStatus)
    const conversationLoading= ! ["succeeded", 'failed', 'idle'].includes(conversationStatus)
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        const agentId = location.pathname.split("/").pop() as string;
        agentDispatch.getAgentDetail(agentId);
        userDispatch.fetchUser();

        return () => {
            agentDispatch.resetAgent();
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    useEffect(() => {
        const fetchData = async () => {
            const searchParams = new URLSearchParams(location.search); // 解析查询参数
            const chatId = searchParams.get("chat");
            if (chatId) {
                // 如果有 chatId，可以在这里处理
                setSelectedConversationId(chatId);
                dispatchConversation.getConversationDetail(chatId, query);
                dispatchConversation.setConversationStatePartialInfo({isNewConversation: false, query: null});
            } else {
                setSelectedConversationId("-1");
                dispatchConversation.setConversationStatePartialInfo({isNewConversation: true, query: null});
            }
        };

        fetchData().then();

        return () => {
            dispatchConversation.resetConversation();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);


    useEffect(() => {
        if(agentDetail && userDetail)
            dispatchConversation.getConversationList(agentDetail.uuid, {page: 1, size: 20})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentDetail?.id, userDetail?.id, isNewConversation]);

    const handleNewConversation = async () => {
        if(agentDetail)
            navigate(`/agent/display/${agentDetail.uuid}`);
    };

    const handleConversationDelete = async (conversation_id: number) => {
        try {
            await dispatchConversation.removeConversation(conversation_id);
            if(agentDetail && conversationDetail?.id === conversation_id)
                navigate(`/agent/display/${agentDetail.uuid}`);
            message.success('会话删除成功');
        } catch {
            message.error('删除会话失败');
        }
    };

    const handleConversationClick =(conversation_uuid: string) => {
        if(agentDetail)
            navigate(`/agent/display/${agentDetail.uuid}?chat=${conversation_uuid}`);
    }

    const handleAgentFavorite =(uuid: string, favorite: boolean) => {
        agentDispatch.setAgentFavorite(uuid, favorite);
    }

    const handleAgentRating =(uuid: string, rating_value: number) => {
        agentDispatch.setAgentRating(uuid, rating_value);
    }

    const handleConversationRename =(uuid: string, name: string) => {
        dispatchConversation.updateConversationInfo(uuid, {name: name});
    }

    return (
        <div className={`h-screen ${cozeLightBg} flex flex-col`}>
            {/* Fixed Header */}
            {!expanded && <div
                className={`bg-white border-b ${cozeBorder} flex items-center justify-between px-6 py-4 shadow-sm h-[60px] w-100`}>
                <AgentDisplayHeader onMenuFold={() => setExpanded(true)} agentData={agentDetail}
                                    agentEditable={agentDetail?.creator_id === userDetail?.id}/>
            </div>}

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar with Agent Info and Conversation List */}
                {expanded && <AgentDisplaySidebar
                    loading={agentLoading}
                    agentData={agentDetail}
                    agentEditable={agentDetail?.creator_id === userDetail?.id}
                    conversations={conversations.items}
                    selectedConversationId={selectedConversationId}
                    onConversationClick={handleConversationClick}
                    onConversationCreate={handleNewConversation}
                    onConversationDelete={handleConversationDelete}
                    onConversationRename={handleConversationRename}
                    onExpand={() => setExpanded(false)}
                    onFavorite={handleAgentFavorite}
                    onRating={handleAgentRating}
                />}

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                    <EmulatorComponent
                        loading={conversationLoading}
                        conversation={conversationDetail}
                        agent={agentDetail}
                        isNewConversation={isNewConversation}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgentDisplayPage;