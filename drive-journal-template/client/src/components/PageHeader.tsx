import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="bg-black bg-opacity-70 border-b border-blue-900 py-6 mb-8">
      <div className="container mx-auto px-4">
        <h1 className="font-orbitron text-3xl md:text-4xl text-blue-400 tracking-wider">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-400 mt-1 tracking-wide text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;