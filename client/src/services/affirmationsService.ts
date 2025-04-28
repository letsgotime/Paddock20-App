// Array of positive affirmations for the Manifestation Station
const affirmations = [
  "I am worthy of my dreams and have the power to manifest them.",
  "Every day, I am one step closer to my goals.",
  "I possess all the qualities needed to be extremely successful.",
  "Wealth and abundance flow freely to me.",
  "I attract success naturally.",
  "My potential to succeed is infinite.",
  "I am attracting my dream car through disciplined action.",
  "I deserve to drive the vehicle of my dreams.",
  "I am aligned with the energy of wealth and luxury.",
  "Money comes to me easily and effortlessly.",
  "I am worthy of my dream timepiece.",
  "My mindset creates my reality.",
  "I am magnetic to opportunities that bring wealth.",
  "I am the creator of my destiny.",
  "I transform challenges into stepping stones toward my dreams.",
  "I attract exactly what I focus on.",
  "My hard work is rewarded in expected and unexpected ways.",
  "I am open to receiving abundance in all areas of my life.",
  "Every day, my aspirations come closer to my reality.",
  "The universe conspires to help me achieve my dreams.",
  "I release all resistance to attracting what I desire.",
  "My success is inevitable because I take consistent action.",
  "I am worthy of the finer things in life.",
  "I am in the process of becoming the best version of myself.",
  "I attract the right people and resources to help manifest my dreams.",
  "My dreams are not too big; they are worthy of my pursuit.",
  "I deserve all the good things coming my way.",
  "My dedication to daily discipline creates extraordinary results.",
  "The path to my dreams is revealing itself each day.",
  "I transform my thoughts into things through focused intention and action."
];

// Function to get a random affirmation
export const getRandomAffirmation = (): string => {
  const randomIndex = Math.floor(Math.random() * affirmations.length);
  return affirmations[randomIndex];
};

// Function to get a set of three different affirmations
export const getThreeAffirmations = (): string[] => {
  const shuffled = [...affirmations].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

// Function to get an affirmation by category (using simple keyword matching)
export const getAffirmationByCategory = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  
  const filtered = affirmations.filter(affirmation => {
    if (lowerCategory.includes('car') && affirmation.toLowerCase().includes('car')) {
      return true;
    }
    if (lowerCategory.includes('watch') || lowerCategory.includes('timepiece') && 
        (affirmation.toLowerCase().includes('timepiece') || affirmation.toLowerCase().includes('watch'))) {
      return true;
    }
    if (lowerCategory.includes('wealth') || lowerCategory.includes('money') && 
        (affirmation.toLowerCase().includes('wealth') || affirmation.toLowerCase().includes('money'))) {
      return true;
    }
    return false;
  });
  
  // If no specific affirmations found, return a random one
  if (filtered.length === 0) {
    return getRandomAffirmation();
  }
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

export default {
  getRandomAffirmation,
  getThreeAffirmations,
  getAffirmationByCategory
};