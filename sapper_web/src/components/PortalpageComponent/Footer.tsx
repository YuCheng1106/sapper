import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-indigo-400 mb-4">Sapper</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              无需编码即可构建、定制和部署强大的AI智能体
            </p>
            {/*<div className="flex space-x-4">*/}
            {/*  <a href="#social-facebook" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Facebook size={20} />*/}
            {/*  </a>*/}
            {/*  <a href="#social-twitter" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Twitter size={20} />*/}
            {/*  </a>*/}
            {/*  <a href="#social-instagram" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Instagram size={20} />*/}
            {/*  </a>*/}
            {/*  <a href="#social-linkedin" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Linkedin size={20} />*/}
            {/*  </a>*/}
            {/*  <a href="#social-github" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Github size={20} />*/}
            {/*  </a>*/}
            {/*</div>*/}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            {/*<ul className="space-y-3">*/}
            {/*  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>*/}
            {/*  <li><a href="#templates" className="text-gray-400 hover:text-white transition-colors">Templates</a></li>*/}
            {/*  <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>*/}
            {/*  <li><a href="#integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>*/}
            {/*  <li><a href="#enterprise" className="text-gray-400 hover:text-white transition-colors">Enterprise</a></li>*/}
            {/*</ul>*/}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            {/*<ul className="space-y-3">*/}
            {/*  <li><a href="#docs" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>*/}
            {/*  <li><a href="#api" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>*/}
            {/*  <li><a href="#guides" className="text-gray-400 hover:text-white transition-colors">Guides</a></li>*/}
            {/*  <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>*/}
            {/*  <li><a href="#community" className="text-gray-400 hover:text-white transition-colors">Community</a></li>*/}
            {/*</ul>*/}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            {/*<ul className="space-y-3">*/}
            {/*  <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>*/}
            {/*  <li><a href="#careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>*/}
            {/*  <li><a href="#partners" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>*/}
            {/*  <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>*/}
            {/*  <li><a href="#legal" className="text-gray-400 hover:text-white transition-colors">Legal</a></li>*/}
            {/*</ul>*/}
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Sapper. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="text-gray-500 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;