import React, { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <h1 className="text-2xl md:text-3xl font-orbitron text-white">{title}</h1>
      </div>
      {subtitle && <p className="text-gray-400 mt-2 max-w-3xl">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;