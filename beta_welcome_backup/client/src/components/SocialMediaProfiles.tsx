import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

interface SocialMediaProfilesProps {
  className?: string;
  showTitle?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
}

interface SocialMediaLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  bgColor: string;
  hoverBgColor: string;
}

const SocialMediaProfiles: React.FC<SocialMediaProfilesProps> = ({
  className = '',
  showTitle = true,
  iconSize = 'md',
  alignment = 'left'
}) => {
  const { user } = useAuth();
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const containerAlignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };
  
  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  // Load social media links based on the current authenticated user
  useEffect(() => {
    const loadSocialMedia = () => {
      // Try to get data from user profile context first 
      try {
        // If we have user data from auth context with socialMedia field
        if (user && user.socialMedia && Array.isArray(user.socialMedia)) {
          setSocialMediaLinks(user.socialMedia);
          return;
        }
        
        // Otherwise try localStorage as a fallback
        const profileData = localStorage.getItem('paddock20_user_profile');
        if (profileData) {
          const parsedData = JSON.parse(profileData);
          if (parsedData?.socialMedia && Array.isArray(parsedData.socialMedia) && parsedData.socialMedia.length > 0) {
            setSocialMediaLinks(parsedData.socialMedia);
            return;
          }
        }
        
        // Try company settings
        const settingsData = localStorage.getItem('paddock20_settings');
        if (settingsData) {
          const parsedSettings = JSON.parse(settingsData);
          if (parsedSettings?.companySocialMedia && Array.isArray(parsedSettings.companySocialMedia) && parsedSettings.companySocialMedia.length > 0) {
            setSocialMediaLinks(parsedSettings.companySocialMedia);
            return;
          }
        }
        
        // If not found, create default empty array - no hardcoded fallbacks
        setSocialMediaLinks([]);
      } catch (error) {
        console.error('Error getting social media data:', error);
        setSocialMediaLinks([]);
      }
    };
    
    loadSocialMedia();
  }, [user]);
  
  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className={`mb-4 ${titleAlignmentClasses[alignment]}`}>
          <h2 className="font-orbitron text-2xl text-blue-400 mb-2">Social Media</h2>
          <p className="text-gray-400 mb-4">Click the link or icon to access our Social Media accounts</p>
        </div>
      )}
      
      <div className={`flex flex-wrap gap-4 ${containerAlignmentClasses[alignment]}`}>
        {socialMediaLinks.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-xl transition-all duration-300 ease-in-out ${iconSizeClasses[iconSize]}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${link.bgColor} group-hover:${link.hoverBgColor} transition-all duration-300`}></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <div className={iconSize === 'sm' ? 'w-5 h-5' : iconSize === 'md' ? 'w-7 h-7' : 'w-9 h-9'}>
                {link.icon}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaProfiles;