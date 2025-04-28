import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

// Define possible social platforms
type SocialPlatform = 'facebook' | 'twitter' | 'pinterest' | 'linkedin' | 'reddit' | 'whatsapp' | 'email' | 'copy';

// Interface for the component props
interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  platforms?: SocialPlatform[];
}

export default function SocialShareButtons({
  url,
  title,
  description = '',
  image = '',
  className = '',
  size = 'md',
  showLabels = false,
  platforms = ['facebook', 'twitter', 'linkedin', 'pinterest', 'reddit', 'whatsapp', 'email', 'copy']
}: SocialShareButtonsProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  // Ensure we have a valid URL by using the current URL if none is provided
  const shareUrl = url || window.location.href;
  
  // Icon and button size configuration based on the size prop
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  // Platform-specific configurations
  const platformConfig = {
    facebook: {
      label: 'Share on Facebook',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
        </svg>
      ),
      color: 'text-white bg-[#1877F2] hover:bg-[#0E65D5]',
      share: () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(fbUrl, 'facebook-share', 'width=580,height=296');
      }
    },
    twitter: {
      label: 'Share on Twitter / X',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'text-white bg-black hover:bg-gray-800',
      share: () => {
        const tweet = `${title} ${shareUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
        window.open(twitterUrl, 'twitter-share', 'width=550,height=235');
      }
    },
    pinterest: {
      label: 'Save to Pinterest',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M12.0002 0C5.37299 0 0 5.37299 0 12.0002C0 17.0941 3.16153 21.4138 7.64971 23.0528C7.55937 22.1241 7.46934 20.7037 7.70971 19.6682C7.92706 18.732 9.11113 13.7054 9.11113 13.7054C9.11113 13.7054 8.75492 12.9939 8.75492 11.9157C8.75492 10.2289 9.72511 8.97615 10.9303 8.97615C11.9688 8.97615 12.4735 9.76263 12.4735 10.7044C12.4735 11.7567 11.8166 13.3566 11.48 14.8483C11.1975 16.0828 12.0966 17.0837 13.3143 17.0837C15.5335 17.0837 17.2236 14.7765 17.2236 11.4231C17.2236 8.56016 15.1983 6.54997 12.0694 6.54997C8.50399 6.54997 6.30007 9.22631 6.30007 11.845C6.30007 12.8736 6.67829 13.8997 7.16094 14.4908C7.27161 14.6258 7.28184 14.7451 7.25115 14.8855C7.17164 15.2353 6.97508 16.0251 6.93974 16.1783C6.89416 16.3719 6.7741 16.4187 6.57755 16.3213C4.97386 15.6032 4.0225 13.4841 4.0225 11.7811C4.0225 7.97771 7.00172 4.40455 12.4067 4.40455C16.7538 4.40455 20.0764 7.46938 20.0764 11.5C20.0764 15.925 17.3768 19.1467 13.5454 19.1467C12.2852 19.1467 11.1009 18.5027 10.7105 17.7533C10.7105 17.7533 10.0868 20.4997 9.94215 21.031C9.69148 22.037 8.99758 23.2426 8.49417 24.0002C9.61252 24.3325 10.7902 24.5032 12.0002 24.5032C18.6273 24.5032 24.0003 19.1303 24.0003 12.5032C24.0003 5.87614 18.6273 0 12.0002 0Z" />
        </svg>
      ),
      color: 'text-white bg-[#E60023] hover:bg-[#C8001A]',
      share: () => {
        let pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}`;
        pinUrl += `&description=${encodeURIComponent(title)}`;
        
        if (image) {
          pinUrl += `&media=${encodeURIComponent(image)}`;
        }
        
        window.open(pinUrl, 'pinterest-share', 'width=750,height=530');
      }
    },
    linkedin: {
      label: 'Share on LinkedIn',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: 'text-white bg-[#0A66C2] hover:bg-[#084B8F]',
      share: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, 'linkedin-share', 'width=750,height=600');
      }
    },
    reddit: {
      label: 'Share on Reddit',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      color: 'text-white bg-[#FF4500] hover:bg-[#E03E01]',
      share: () => {
        const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        window.open(redditUrl, 'reddit-share', 'width=750,height=600');
      }
    },
    whatsapp: {
      label: 'Share on WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      color: 'text-white bg-[#25D366] hover:bg-[#1DA851]',
      share: () => {
        const whatsappText = `${title} ${shareUrl}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, 'whatsapp-share', 'width=550,height=450');
      }
    },
    email: {
      label: 'Share via Email',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
          <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
        </svg>
      ),
      color: 'text-white bg-gray-600 hover:bg-gray-700',
      share: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${description}\n\n${shareUrl}`);
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
      }
    },
    copy: {
      label: 'Copy Link',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSizes[size]}>
          <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z" clipRule="evenodd" />
          <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12z" />
          <path d="M10.5 10.5a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963 5.23 5.23 0 00-3.434-1.279h-1.875a.375.375 0 01-.375-.375V10.5z" />
        </svg>
      ),
      color: 'text-white bg-gray-800 hover:bg-gray-900',
      share: () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setIsCopied(true);
          toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard.",
            duration: 3000,
          });
          
          setTimeout(() => {
            setIsCopied(false);
          }, 3000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
          toast({
            title: "Failed to copy",
            description: "Please try again or copy the URL manually.",
            variant: "destructive",
          });
        });
      }
    }
  };

  // Filter platforms based on the platforms prop
  const filteredPlatforms = platforms.filter(platform => 
    platformConfig.hasOwnProperty(platform)
  ) as SocialPlatform[];

  // Determine button layout class based on showLabels
  const buttonLayoutClass = showLabels ? 'flex items-center gap-2 px-3' : 'flex items-center justify-center';

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filteredPlatforms.map(platform => {
        const config = platformConfig[platform];
        
        return (
          <TooltipProvider key={platform}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={config.share}
                  className={`${buttonSizes[size]} ${buttonLayoutClass} ${config.color} transition-all`}
                  aria-label={config.label}
                >
                  {config.icon}
                  {showLabels && (
                    <span className="whitespace-nowrap">
                      {platform === 'copy' && isCopied ? 'Copied!' : config.label}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}