import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Zap, Code } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import landing_video1 from "../../assets/images/landing_selling_point_1_1.mp4";
import landing_video3 from "../../assets/images/landing_selling_point_1_3.mp4";
import { motion } from "framer-motion"

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const go_sapperpage = () => {
    navigate("/workspace");
  };
  //当前演示的视频
  const videos = [
    {
      title: "可视化界面，表单式操作，开发效率瞬间提升",
      description: "无需任何代码基础，小学生也能创作智能AI",
      videoUrl: landing_video1
    },
    {
      title: "个性化定制，打造用户专属助理",
      description: "通过我们直观的界面微调响应和个性设置",
      videoUrl: landing_video1
    },
    {
      title: "自动化优化，让创作内容更丰富",
      description: "自主添加知识库，使智能体更好地满足用户需求，实现精准化输出",
      videoUrl: landing_video3
    }
  ];
  //视频切换
  const handleVideoChange = useCallback((newIndex: number) => {
    setIsTransitioning(true);
    setActiveVideo(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  const nextVideo = useCallback(() => {
    handleVideoChange((activeVideo + 1) % videos.length);
  }, [activeVideo, handleVideoChange]);

  const prevVideo = useCallback(() => {
    handleVideoChange((activeVideo - 1 + videos.length) % videos.length);
  }, [activeVideo, handleVideoChange]);
//处理鼠标滚动事件
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    if (event.deltaY > 0) {
      nextVideo();
    } else {
      prevVideo();
    }
  }, [nextVideo, prevVideo]);

  useEffect(() => {
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        videoContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  return (
      <section className="pt-28 pb-16 md:pt-32 md:pb-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16 relative z-10 group">
            {/* 背景光效 */}
            <div className="absolute -inset-8 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                  className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 blur-xl rounded-3xl"></div>
            </div>

            {/* 标题部分 */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8}}
                className="mb-10"
            >
              <h1 className="text-3xl md:text-4xl lg:text-[2.8rem] font-bold text-gray-900 mb-6 leading-[1.2] tracking-tight">
                让每个好想法都能变成
                <span className="relative inline-block">
        <span className="relative z-10">AI智能体</span>
        <span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-100/80 z-0"></span>
      </span>
                <br className="hidden md:block"/>
                <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block mt-4 leading-[1.3]">
  你要做的只是描述需求，剩下的交给我们
</span>
              </h1>

              <motion.p
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.2, duration: 0.8}}
                  className="text-base md:text-lg text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                无需代码，快速打造AI智能体
                <span className="hidden sm:inline">，</span>
                <br className="sm:hidden"/>
                一键生成，即时开启高效沟通
              </motion.p>
            </motion.div>

            {/* 按钮组 */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.4, duration: 0.8}}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  onClick={go_sapperpage}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto relative overflow-hidden group"
              >
      <span className="relative z-10 flex items-center">
        快速开始
        <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1"/>
      </span>
                <span
                    className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.a>

              <motion.a
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  className="px-8 py-3.5 rounded-full border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
              >
                观看演示
              </motion.a>
            </motion.div>
          </div>

          <div className="relative max-w-5xl mx-auto pt-12 pb-24" style={{display: "none"}}>

            {/* Video title */}
            <div className="text-center mb-6 transform transition-all duration-500 ease-out">
              <h2 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500 mb-2 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {videos[activeVideo].title}
              </h2>
              <p className={`text-indigo-600/80 max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {videos[activeVideo].description}
              </p>
            </div>

            {/* Main video display */}
            <div className="relative">
              <div
                  id="video-container"
                  className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 cursor-ns-resize ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
              >
                <div className="relative">
                  <div className="aspect-[16/9] bg-indigo-200 flex items-center justify-center">
                    <video
                        src={videos[activeVideo].videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Vertical navigation buttons */}
              <div
                  className="hidden md:flex absolute right-[-60px] top-1/2 transform -translate-y-1/2 flex-col items-center gap-4">
                {videos.map((video, index) => (
                    <button
                        key={`desktop-${index}`}
                        onClick={() => handleVideoChange(index)}
                        className={`rounded-full transition-all duration-300 shadow-lg hover:scale-110 cursor-pointer ${
                            index === activeVideo
                                ? 'w-4 h-16 bg-indigo-600'
                                : 'w-3 h-8 bg-indigo-200 hover:bg-indigo-300'
                        }`}
                        aria-label={`切换到${video.title}`}
                    />
                ))}
              </div>

              {/* Mobile navigation */}
              <div className="flex md:hidden justify-center gap-3 mt-6">
                {videos.map((_, index) => (
                    <button
                        key={`mobile-${index}`}
                        onClick={() => handleVideoChange(index)}
                        className={`rounded-full transition-all duration-300 ${
                            index === activeVideo
                                ? 'w-16 h-3 bg-indigo-600'
                                : 'w-8 h-3 bg-indigo-200 hover:bg-indigo-300'
                        }`}
                        aria-label={`Video ${index + 1}`}
                    />
                ))}
              </div>
            </div>

            {/* Floating cards */}
            <div
                className="absolute -bottom-6 -left-4 md:-left-40 w-32 md:w-48 h-32 bg-white rounded-lg shadow-lg p-4 transform rotate-6 hidden md:block">
              <div className="flex items-center space-x-2 mb-2">
                <Zap size={18} className="text-yellow-500"/>
                <span className="text-sm font-medium text-gray-800">智能体开发</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full w-3/4"></div>
              </div>
              <p className="text-xs text-gray-500 mt-3">AI赋能</p>
            </div>

            <div
                className="absolute -bottom-12 -right-4 md:-right-40 w-32 md:w-48 h-32 bg-white rounded-lg shadow-lg p-4 transform -rotate-3 hidden md:block">
              <div className="flex items-center space-x-2 mb-2">
                <Code size={18} className="text-indigo-500"/>
                <span className="text-sm font-medium text-gray-800">无代码部署</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>无需编程经验</p>
                <p className="mt-1">人人都是智能体创作专家</p>
              </div>
            </div>
          </div>


          {/* Stats section */}
          <div className="container mx-auto px-4 md:px-6 mt-24">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">500+</p>
                <p className="text-gray-600">已上线智能体</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">100K+</p>
                <p className="text-gray-600">用户</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">1000K+</p>
                <p className="text-gray-600">日常访问量</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">10+</p>
                <p className="text-gray-600">合作企业</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default HeroSection;