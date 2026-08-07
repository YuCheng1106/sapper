import React, { useEffect, useRef } from 'react';
import { Zap, Bot, Puzzle, Globe, Code, BarChart, Shield, Sparkles } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

const FeatureCard: React.FC<{
  icon: React.ReactNode,
  title: string,
  description: string,
  index: number
}> = ({ icon, title, description, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.1 * index,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.1 * index + 0.2,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      scale: 1.15,
      rotate: 5,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
      <motion.div
          className="relative bg-white p-7 md:p-8 rounded-xl border border-gray-100 overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
      >
        {/* 悬停时的微光效果 */}
        <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 opacity-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        />

        <motion.div
            className="relative z-10 w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center mb-6 shadow-sm"
            variants={iconVariants}
        >
          {icon}
        </motion.div>
        <h3 className="relative z-10 text-xl font-semibold mb-3 text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent">
          {title}
        </h3>
        <p className="relative z-10 text-gray-600 leading-relaxed">{description}</p>
      </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const features = [
    {
      icon: <Zap size={26} className="text-indigo-600" />,
      title: "无代码平台",
      description: "使用直观的表达界面构建复杂的AI智能体，不需要任何编码知识。"
    },
    {
      icon: <Bot size={26} className="text-indigo-600" />,
      title: "AI智能体",
      description: "利用最先进的大模型创建能够理解自然语言并智能响应的智能体"
    },
    {
      icon: <Puzzle size={26} className="text-indigo-600" />,
      title: "可定制表单",
      description: "快速开始为客户服务先构建的表单。"
    },
    {
      icon: <Globe size={26} className="text-indigo-600" />,
      title: "多平台发布",
      description: "通过单一界面在网站、移动应用程序、社交媒体和消息传递平台上部署智能体。"
    },
    {
      icon: <Code size={26} className="text-indigo-600" />,
      title: "API 接口",
      description: "通过我们全面的API接口支持，将您的智能体连接到现有的系统和服务。"
    },
    {
      icon: <BarChart size={26} className="text-indigo-600" />,
      title: "实时对话",
      description: "通过详细的流程分析和对话，确保您的智能体高质量。"
    },
    {
      icon: <Shield size={26} className="text-indigo-600" />,
      title: "企业安全",
      description: "使用企业级安全功能保护数据，包括加密和基于角色的访问控制。"
    },
    {
      icon: <Sparkles size={26} className="text-indigo-600" />,
      title: "持续学习",
      description: "随着时间的推移，你的智能体会从对话中学习。"
    }
  ];

  return (
      <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
              className="max-w-4xl mx-auto text-center mb-20"
              initial="hidden"
              animate={controls}
              variants={{}}
          >
            <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight"
                variants={titleVariants}
            >
            <span className="bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent">
              强大的功能
            </span>
              ，创造卓越的人工智能体验
            </motion.h2>
            <motion.p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                variants={subtitleVariants}
            >
              构建、部署和扩展AI智能体所需的一切，专为现代企业设计
            </motion.p>
          </motion.div>

          <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
              ref={ref}
              initial="hidden"
              animate={controls}
              variants={containerVariants}
          >
            {features.map((feature, index) => (
                <FeatureCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    index={index}
                />
            ))}
          </motion.div>
        </div>
      </section>
  );
};

export default FeaturesSection;