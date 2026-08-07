import React, {useEffect} from 'react';
import { List, Card, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import { ThunderboltFilled, UserOutlined, FireFilled } from '@ant-design/icons';
import { useInView } from 'react-intersection-observer';
import {useAgentSelector, useDispatchAgent} from "../../hooks/agent.ts";
import Meta from "antd/es/card/Meta";
import { ChevronRight} from 'lucide-react';
import { useNavigate } from "react-router-dom";
const { Title } = Typography;

const TemplatesSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const agents = useAgentSelector((state) => state.agent.publicAgents.items);
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatchAgent();

  useEffect(() => {
    dispatch.getAllPublicAgents({ size: 40 });
  }, []);

  // Get 4 random agents from the public agents list
  const randomAgents = React.useMemo(() => {
    if (!agents || agents.length === 0) return [];
    const shuffled = [...agents].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [agents]);

  const cardVariants = {
    initial: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.02,
      y: -8,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };


  return (
      <section id='botcases' className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
              ref={ref}
              initial={{opacity: 0, y: 20}}
              animate={inView ? {opacity: 1, y: 0} : {opacity: 0, y: 20}}
              transition={{duration: 0.6}}
              className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              随时可用的AI智能体
            </span>
              ，满足您的各种需求
            </h2>
            <p className="text-xl text-gray-600">
              快速开始与我们的已上线智能体或自定义自己的智能体，打造专属人工智能解决方案
            </p>
          </motion.div>

          {randomAgents.length > 0 && (
              <List
                  grid={{
                    gutter: 32,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 4,
                    xl: 4,
                    xxl: 4
                  }}
                  dataSource={randomAgents}
                  renderItem={(agent, index) => (
                      <List.Item key={agent.uuid} className="mb-6 md:mb-8">
                        <motion.div
                            initial="initial"
                            whileHover="hover"
                            variants={cardVariants}
                            onMouseEnter={() => setHoveredCard(agent.uuid)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="w-full"

                        >
                          <Card
                              className="w-full rounded-[16px] md:rounded-[20px] overflow-hidden transition-all duration-400 bg-white relative border border-[rgba(0,0,0,0.06)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#7F56D9] before:to-[#9E77ED] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                              bordered={false}
                              onClick={() => navigate(`/agent/display/${agent.uuid}`)}
                              hoverable
                              cover={
                                <div className="relative h-[160px] md:h-[200px] overflow-hidden bg-[#f5f5f5]">
                                  {agent.cover_image ? (
                                      <motion.div
                                          animate={{
                                            scale: hoveredCard === agent.uuid ? 1.05 : 1
                                          }}
                                          transition={{duration: 0.5}}
                                      >
                                        <img
                                            alt={agent.name}
                                            src={`${import.meta.env.VITE_API_BASE_URL}${agent.cover_image}`}
                                            className="w-full h-full object-cover transition-transform duration-600"
                                        />
                                      </motion.div>
                                  ) : (
                                      <div
                                          className="w-full h-full bg-gradient-to-r from-[#F4EBFF] to-[#E9D7FE] flex items-center justify-center">
                                        <UserOutlined className="text-[36px] md:text-[48px] text-[#9E77ED]"/>
                                      </div>
                                  )}
                                  <div
                                      className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-3 md:p-4 bg-gradient-to-t from-black/70 to-transparent">
                                    <Tag
                                        className="rounded-lg font-semibold border-none backdrop-blur-md bg-[rgba(127,86,217,0.3)] text-white px-3 py-1 md:px-[14px] md:py-[6px] text-xs md:text-sm uppercase tracking-wider">
                                      {agent.type === 0 ? '管理类' : '工具类'}
                                    </Tag>
                                    <div
                                        className="flex items-center gap-1 md:gap-[6px] text-white text-xs md:text-sm font-semibold backdrop-blur-md bg-white/20 px-2 py-1 md:px-[14px] md:py-[6px] rounded-[20px]">
                                      <FireFilled className="text-[#FEF3C7]"/>
                                      <span>热门</span>
                                    </div>
                                  </div>
                                </div>
                              }
                              bodyStyle={{padding: '0 0 12px 0'}}
                          >
                            <motion.div
                                initial="hidden"
                                animate={inView ? "visible" : "hidden"}
                                variants={contentVariants}
                                transition={{delay: index * 0.1}}
                            >
                              <Meta
                                  title={
                                    <div
                                        className="flex justify-between items-center text-xl md:text-2xl font-bold text-[#344054] mb-2 md:mb-3 px-4 pt-4 pb-2 md:px-5 md:pt-5 md:pb-2.5 tracking-[-0.5px]">
                                      <Title level={4} className="!m-0 !text-inherit">{agent.name}</Title>

                                    </div>
                                  }
                                  description={
                                    <div
                                        className="text-[#475467] text-sm md:text-[15px] leading-relaxed h-12 overflow-hidden line-clamp-2 px-4 md:px-5 mb-4 md:mb-5">
                                      {agent.description || '暂无描述'}
                                    </div>
                                  }
                              />
                              <div
                                  className="mt-4 px-4 py-3 md:px-5 md:py-4 flex flex-wrap justify-between items-center gap-2 border-t border-[#F2F4F7] bg-[#FAFAFA]">
                                <div className="flex gap-2 flex-wrap">
                                  <Tag
                                      icon={<ThunderboltFilled className="text-xs md:text-sm"/>}
                                      color="gold"
                                      className="rounded-md px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-[13px] font-medium border-transparent transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
                                  >
                                    快速响应
                                  </Tag>
                                  <Tag
                                      color="purple"
                                      className="rounded-md px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-[13px] font-medium border-transparent transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
                                  >
                                    免费使用
                                  </Tag>
                                </div>
                                <motion.div
                                    className="text-[#7F56D9] font-semibold text-sm md:text-[15px] cursor-pointer transition-all duration-300 hover:text-[#6941C6] hover:translate-x-1 flex items-center gap-1 whitespace-nowrap"
                                    initial={{opacity: 0}}
                                    animate={{
                                      opacity: hoveredCard === agent.uuid ? 1 : 0,
                                      x: hoveredCard === agent.uuid ? 0 : -10
                                    }}
                                    transition={{duration: 0.3}}
                                >
                                  立即体验 →
                                </motion.div>
                              </div>
                            </motion.div>
                          </Card>
                        </motion.div>
                      </List.Item>

                  )}
              />
          )}
          <motion.div
              className="text-center mt-12"
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.4, duration: 0.3}}
          >
            <button
                onClick={() => navigate('/discover')}
                className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors duration-150 group bg-transparent border-none p-0" // 清除按钮默认样式
            >
              <span className="group-hover:underline">浏览所有智能体</span>
              <ChevronRight
                  size={18}
                  className="ml-1 transition-transform duration-150 group-hover:translate-x-1"
              />
            </button>
          </motion.div>
        </div>
      </section>
  );
};

export default TemplatesSection;