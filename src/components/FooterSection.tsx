"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const FooterSection: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">Learnzaa STEM</h3>
            <p className="text-gray-400">Empowering the next generation of scientists, engineers, and innovators through quality STEM education.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/lessons" className="text-gray-400 hover:text-white transition-colors">STEM Lessons</Link></li>
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
              <a href="https://www.instagram.com/emtra_co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://search.brave.com/images?q=X+%28social+network%29&context=W3sic3JjIjoiaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi9jL2NlL1hfbG9nb18yMDIzLnN2Zy8yNTBweC1YX2xvZ29fMjAyMy5zdmcucG5nIiwidGV4dCI6IlggbG9nbyAyMDIzIiwicGFnZV91cmwiOiJodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ud2l0dGVyIn1d&sig=81c8455b9029b2d9d74f7cc05af02ef4eac20cfeefed68daf34cd547d60b67a3&nonce=2cc07c9496c249233e3ace50ac342198&source=infoboxImg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2026 Learnzaa STEM. All rights reserved.</p>
          <MadeWithDyad />
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;