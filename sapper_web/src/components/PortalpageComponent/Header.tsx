import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import {motion} from "framer-motion";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
            >
              Sapper
            </motion.h1>

            <nav className="hidden md:flex ml-12">
              <ul className="flex space-x-8">
                <li>
                  <a href="#features" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                    平台简介
                  </a>
                </li>
                <li>
                  <a href="#botcases" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                    智能体案例
                  </a>
                </li>
                <li>
                  <a href="#expertagree" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                    专家认可
                  </a>
                </li>
                {/*<li>*/}
                {/*  <a href="#docs" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">*/}
                {/*    文档中心*/}
                {/*  </a>*/}
                {/*</li>*/}
              </ul>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center">
              {/*<Globe size={18} className="text-gray-600 mr-1" />*/}
              {/*<span className="text-gray-700 font-medium">EN</span>*/}
              {/*<ChevronDown size={16} className="text-gray-600 ml-1" />*/}
            </div>
            <a href="/login" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              登录
            </a>
            <a 
              href="/register"
              className="px-5 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              注册
            </a>
          </div>

          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t mt-2 shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <li>
                <a 
                  href="#features" 
                  className="block font-medium text-gray-700 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  平台简介
                </a>
              </li>
              <li>
                <a 
                  href="#botcases"
                  className="block font-medium text-gray-700 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  智能体案例
                </a>
              </li>
              <li>
                <a 
                  href="#expertagree"
                  className="block font-medium text-gray-700 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  专家认可
                </a>
              </li>
              {/*<li>*/}
              {/*  <a */}
              {/*    href="#docs" */}
              {/*    className="block font-medium text-gray-700 py-2"*/}
              {/*    onClick={() => setIsMenuOpen(false)}*/}
              {/*  >*/}
              {/*   文档中心*/}
              {/*  </a>*/}
              {/*</li>*/}
              <li className="pt-2 border-t">
                <a 
                  href="#login"
                  className="block px-5 py-2 text-center rounded-full bg-indigo-600 text-white font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </a>
              </li>
              <li>
                <a 
                  href="#signup" 
                  className="block px-5 py-2 text-center rounded-full bg-indigo-600 text-white font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                 注册
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;