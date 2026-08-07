import { useState } from 'react';
import { ArrowRightCircle,Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import techer_lzs from '../../assets/images/techer_lzs.png';
import user_avater1 from '../../assets/images/user_avater1.jpg';
import user_background from '../../assets/images/user_background1.jpg';

const sampleAgents = [
    {
        id: '1',
        name: '高中英语作文教师',
        username:'有知无涯',
        useravater:user_avater1,
        image: techer_lzs,
        uuid:'8dccbc46-a77a-4b28-abef-1a2a66ab2394',
        specialty: '学习教育',
    }
];

const RecommendedAgentComponent = () => {
    const agent = sampleAgents[0];
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="w-full p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl overflow-hidden mb-4">
            <motion.div
                className="flex flex-col lg:flex-row gap-6 items-center"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                {/* Left side - Content */}
                <div className="lg:w-1/2 space-y-4">
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            探索AI教育新境界
                        </h2>
                        <p className="text-gray-600 text-base leading-relaxed">
                            遇见<span className="font-semibold text-indigo-600">{agent.name}</span>，
                            您的专属AI助教。让学习变得更轻松、更有趣、更高效。
                        </p>
                    </div>

                    <button
                        className="group flex items-center gap-5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-300/50 hover:scale-105"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => navigate(`/agent/display/${agent.uuid}`)}
                    >
                        <span className="text-base">立即体验</span>
                        <ArrowRightCircle
                            className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}/>
                    </button>
                </div>

                {/* Right side - Agent Card */}
                <div className="lg:ml-auto">
                    <motion.div
                        className="relative rounded-xl overflow-hidden group"
                        style={{height: '250px', width: '420px'}}
                        whileHover={{y: -5}}
                    >
                        {/* 背景图 */}
                        <div className="absolute inset-0">
                            <img
                             src={user_background}
                            />
                        </div>

                        {/* 底部蒙版 */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>

                        {/* 代理头像 */}
                        <div
                            className="absolute left-4 bottom-4 w-16 h-16  overflow-hidden z-10">
                            <img
                                src={agent.image}
                                alt={agent.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* 内容区域 */}
                        <div className="absolute bottom-4 left-24 right-4 text-white z-10">
                            <div className="flex flex-col space-y-2">
                                {/* 标签 */}
                                <div
                                    className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium w-fit">
                                    <Sparkles className="w-3 h-3"/>
                                    <span>{agent.specialty}</span>
                                </div>

                                {/* 代理名称 */}
                                <h3 className="text-lg font-bold truncate">{agent.name}</h3>

                                {/* 用户信息 - 同一行显示 */}
                                <div className="flex items-center mt-1">
                                    <div
                                        className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 mr-2 border border-white/30">
                                        <img
                                            src={agent.useravater}
                                            alt="用户头像"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="text-xs text-white/80 truncate">
            {agent.username || '未知用户'}
          </span>
                                </div>

                            </div>
                        </div>

                        {/* 悬停效果 */}
                        <div
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default RecommendedAgentComponent;