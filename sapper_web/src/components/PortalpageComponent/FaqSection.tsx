import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ 
  question, answer, isOpen, toggleOpen 
}) => {
  return (
    <div className="border-b border-gray-200 py-5">
      <button 
        className="flex justify-between items-center w-full text-left"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-3 text-gray-600 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FaqSection: React.FC = () => {
  const navigate = useNavigate();
  const faqs = [
    {
      question: "Do I need coding knowledge to use Coze?",
      answer: "No, Coze is designed to be a no-code platform that allows anyone to create sophisticated AI chatbots using our intuitive drag-and-drop interface. No programming experience is required to build and deploy fully functional bots."
    },
    {
      question: "How can I customize my bot's appearance?",
      answer: "Coze offers extensive customization options. You can personalize your bot's avatar, name, greeting messages, and overall chat interface. Our Pro and Enterprise plans also support custom branding with your company's logo and colors."
    },
    {
      question: "What platforms can I deploy my bot on?",
      answer: "Coze bots can be deployed across multiple channels including your website, mobile apps, Facebook Messenger, WhatsApp, Telegram, Discord, Slack, and more. You can manage all deployments from a single interface."
    },
    {
      question: "How does pricing work for message usage?",
      answer: "Each plan includes a monthly message allowance. A message counts as one exchange between a user and your bot. If you exceed your plan's limit, additional messages are charged at a per-message rate, or you can upgrade to a higher plan."
    },
    {
      question: "Can I integrate with my existing systems?",
      answer: "Yes, Coze provides API integration capabilities that allow you to connect your bots with your CRM, help desk, e-commerce platform, and other business systems. Our Enterprise plan includes additional custom integration options."
    },
    {
      question: "What kind of analytics do you provide?",
      answer: "Our analytics dashboard shows conversation metrics, user engagement, frequently asked questions, bot performance, and conversion rates. Pro and Enterprise plans offer more advanced analytics including sentiment analysis and custom reporting."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(index === openIndex ? -1 : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-4 md:px-6">
        {/*<div className="max-w-3xl mx-auto text-center mb-16">*/}
        {/*  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">*/}
        {/*    Frequently asked questions*/}
        {/*  </h2>*/}
        {/*  <p className="text-lg text-gray-600">*/}
        {/*    Get answers to common questions about Coze and how it can work for your business*/}
        {/*  </p>*/}
        {/*</div>*/}

        {/*<div className="max-w-3xl mx-auto">*/}
        {/*  {faqs.map((faq, index) => (*/}
        {/*    <FaqItem */}
        {/*      key={index}*/}
        {/*      question={faq.question}*/}
        {/*      answer={faq.answer}*/}
        {/*      isOpen={index === openIndex}*/}
        {/*      toggleOpen={() => toggleFaq(index)}*/}
        {/*    />*/}
        {/*  ))}*/}
        {/*</div>*/}



        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.8}}
              viewport={{once: true}}
              className="max-w-2xl mx-auto text-center"
          >
            <motion.h2
                className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
                initial={{opacity: 0, y: 10}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.6}}
                viewport={{once: true}}
            >
            <span className="bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent">
              准备好体验未来了吗？
            </span>
            </motion.h2>

            <motion.p
                className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg mx-auto"
                initial={{opacity: 0, y: 10}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.6}}
                viewport={{once: true}}
            >
              立即免费试用我们的平台，开启您的AI之旅
            </motion.p>
            <motion.div
                initial={{opacity: 0, scale: 0.9}}
                whileInView={{opacity: 1, scale: 1}}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.98}}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                  delay: 0.6
                }}
                viewport={{once: true}}
                className="inline-block"
            >
              <motion.button
                  onClick={() => navigate('/workspace')} // 使用 navigate 或自定义点击事件
                  className="relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 overflow-hidden text-lg font-medium rounded-full group bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-none outline-none focus:outline-none"
              >
                {/* 按钮光效 */}
                <span
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                {/* 按钮边缘光效 */}
                <span
                    className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-500"
                />

                {/* 按钮内容 */}
                <span className="relative flex items-center">
      立即免费试用
      <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1"/>
    </span>

                {/* 悬浮粒子效果 */}
                <span className="absolute inset-0 overflow-hidden rounded-full">
      {[...Array(8)].map((_, i) => (
          <span
              key={i}
              className="absolute bg-white rounded-full opacity-0 group-hover:opacity-30"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float-up 0.5s linear infinite`,
                animationDelay: `0.5s`
              }}
          />
      ))}
    </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* 全局样式定义 */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }

          @keyframes float-up {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(-100px) scale(0.5);
              opacity: 0;
            }
          }

          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    </section>
  );
};

export default FaqSection;