import { useState } from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaPinterest, 
  FaLinkedin, 
  FaReddit,
  FaWhatsapp,
  FaEnvelope,
  FaCopy
} from 'react-icons/fa';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

type SharePlatform = 'facebook' | 'twitter' | 'pinterest' | 'linkedin' | 'reddit' | 'whatsapp' | 'email' | 'copy';

interface SocialShareButtonsProps {
  url?: string; // URL to share (defaults to current URL)
  title?: string; // Title to share (defaults to document title)
  description?: string; // Description to share
  image?: string; // Image URL to share (for platforms that support it)
  hashtags?: string[]; // Hashtags to include (for platforms that support it)
  size?: 'sm' | 'md' | 'lg'; // Icon size
  className?: string; // Additional CSS classes
  platforms?: SharePlatform[]; // Platforms to include
}

const SocialShareButtons = ({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = typeof document !== 'undefined' ? document.title : 'Paddock20 Portal',
  description = 'Check out this amazing content on Paddock20!',
  image = '',
  hashtags = ['Paddock20', 'GoTime', 'Motorsports'],
  size = 'md',
  className = '',
  platforms = ['facebook', 'twitter', 'pinterest', 'linkedin', 'whatsapp', 'email', 'copy']
}: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Size mapping
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const iconSize = sizeMap[size];

  // Handle sharing
  const handleShare = (platform: SharePlatform) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedHashtags = hashtags.join(',');
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast({
          title: "Link Copied!",
          description: "The link has been copied to your clipboard.",
          duration: 3000,
        });
        setTimeout(() => setCopied(false), 3000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy the link to clipboard.",
          variant: "destructive",
        });
      });
      return;
    }
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image)}&description=${encodedDescription}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${url}`;
        break;
      default:
        return;
    }
    
    // Open a popup window for sharing (except for email and copy)
    if (platform !== 'email' && platform !== 'copy') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'email') {
      window.location.href = shareUrl;
    }
  };

  // Platform icons and labels mapping
  const platformConfig: Record<string, { icon: React.ReactNode, label: string }> = {
    facebook: { icon: <FaFacebook className={iconSize} />, label: 'Share on Facebook' },
    twitter: { icon: <FaTwitter className={iconSize} />, label: 'Share on Twitter' },
    pinterest: { icon: <FaPinterest className={iconSize} />, label: 'Pin on Pinterest' },
    linkedin: { icon: <FaLinkedin className={iconSize} />, label: 'Share on LinkedIn' },
    reddit: { icon: <FaReddit className={iconSize} />, label: 'Share on Reddit' },
    whatsapp: { icon: <FaWhatsapp className={iconSize} />, label: 'Share on WhatsApp' },
    email: { icon: <FaEnvelope className={iconSize} />, label: 'Share via Email' },
    copy: { icon: <FaCopy className={iconSize} />, label: copied ? 'Copied!' : 'Copy Link' }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <TooltipProvider>
        {platforms.map(platform => (
          <Tooltip key={platform}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleShare(platform)}
                className="p-2 rounded-full bg-black hover:bg-gray-800 text-primary transition-colors duration-200"
                aria-label={platformConfig[platform].label}
              >
                {platformConfig[platform].icon}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{platformConfig[platform].label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default SocialShareButtons;