import React from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  imageUrl: string;
  rating: number;
}

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const titleVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const subtitleVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
      ease: "easeOut"
    }
  }
};

const TestimonialCard: React.FC<TestimonialProps> = ({
                                                       quote, author, role, company, imageUrl, rating
                                                     }) => {
  return (
      <motion.div
          variants={cardVariants}
          className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
          whileHover={{ y: -5 }}
      >
        <div className="flex space-x-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
              <Star
                  key={i}
                  size={18}
                  className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
              />
          ))}
        </div>

        <blockquote className="text-gray-700 mb-6 italic text-lg leading-relaxed">
          "{quote}"
        </blockquote>

        <div className="flex items-center">
          <img
              src={imageUrl}
              alt={author}
              className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white group-hover:border-indigo-100 transition-colors duration-300"
          />
          <div>
            <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{author}</h4>
            <p className="text-sm text-gray-600">{role}</p>
            <p className="text-xs text-gray-500 mt-1">{company}</p>
          </div>
        </div>
      </motion.div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const testimonials = [
    {
      quote: "Sapper 平台融合 SPL 与全周期技术栈，能精准控制大模型，降低开发门槛，极具创新性，有广阔的应用前景，值得关注与推广。",
      author: "邢振昌",
      role: "教授",
      company: "SE4AI团队科学负责人",
      imageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 5
    },
    {
      quote: "由Sapper创造的智能体可以通过自动化和优化算法，解决传统化学合成生产中的效率、产量和安全问题，有助于'微纳'技术的实现。",
      author: "陈芬儿",
      role: "院士",
      company: "中国工程院院士、江西师范大学校长",
      imageUrl: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 5
    },
    {
      quote: "Sapper平台通过智能表单驱动提示词设计方法以及自然语言链式编译技术，让普通人也能简单快速的开发高性能智能体。",
      author: "肖玉麟",
      role: "研究生",
      company: "江西师范大学",
      imageUrl: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      rating: 4
    }
  ];

  return (
      <section id='expertagree'className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
              className="max-w-4xl mx-auto text-center mb-16"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={containerVariants}
          >
            <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight"
                variants={titleVariants}
            >
            <span className="bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent">
              专家认可
            </span>
            </motion.h2>
            <motion.p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                variants={subtitleVariants}
            >
              Sapper是人工智能自主创新重要成果，实现产业高端化、智能化
            </motion.p>
          </motion.div>

          <motion.div
              className="relative"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={containerVariants}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>

            <div className="hidden md:flex items-center justify-between absolute top-1/2 -left-4 -right-4 transform -translate-y-1/2">
              <motion.button
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </motion.button>
              <motion.button
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={20} className="text-gray-700" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
  );
};

export default TestimonialsSection;