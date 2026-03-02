"use client";

import React, { useEffect } from 'react';

interface AdUnitProps {
  type: 'banner' | 'rectangle' | 'inline';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, className }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle error", e);
    }
  }, []);

  const getStyles = () => {
    switch (type) {
      case 'banner':
        return { display: 'block', width: '100%', height: '90px' };
      case 'rectangle':
        return { display: 'inline-block', width: '300px', height: '250px' };
      default:
        return { display: 'block' };
    }
  };

  return (
    <div className={`flex justify-center my-4 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <ins className="adsbygoogle"
           style={getStyles()}
           data-ad-client="ca-pub-6263410073475476"
           data-ad-slot="auto"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdUnit;