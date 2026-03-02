"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const FooterSection: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4 border-t border-gray-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">Learnzaaac</h3>
            <p className="text-gray-400">Making learning fun and interactive for kids in Kenya and beyond.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/lessons" className="text-gray-400 hover:text-white transition-colors">Lessons</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com/e_rr.or404" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2026 Learnzaaac. All rights reserved.</p>
          <div className="flex flex-col items-center gap-2">
            <MadeWithDyad />
            <a href="https://www.instagram.com/emtra_co" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-400">Follow EMTRA</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;