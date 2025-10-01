
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-base-200 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-400">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} AI Photo Boost. All Rights Reserved.
        </p>
        <p className="text-xs mt-2">
          Your images are processed securely and are not stored. We respect your privacy.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
