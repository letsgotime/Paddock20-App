import React, { useState, useEffect } from 'react';
import { 
  Check, CheckSquare, X, Square, AlertCircle, Info, 
  Calendar, Clock, Star, Award, Droplets, RefreshCw,
  Edit, Save, Trash2, Plus, Download, FileDown, Clipboard
} from 'lucide-react';

/**
 * JuiceBox Checklists Component
 * A comprehensive collection of product-specific detailing and maintenance checklists
 * featuring curated real-world tested, GoTime-approved products and techniques
 */
const JuiceBoxChecklists = ({ vehicle }) => {
  const [activeChecklist, setActiveChecklist] = useState('wash');
  const [completedItems, setCompletedItems] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [filteredLists, setFilteredLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [customChecklists, setCustomChecklists] = useState([]);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState({ text: '', brand: '', notes: '' });
  const [showAddChecklistForm, setShowAddChecklistForm] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ name: '', description: '', categories: [] });
  const [userCreatedLists, setUserCreatedLists] = useState([]);
  
  // Detailing Product Checklist
  const detailingChecklists = [
    {
      id: 'wash',
      name: 'Wash Process',
      icon: <Droplets className="h-5 w-5 text-blue-400" />,
      description: 'The curated, real-world tested, gloss-backed, Gavin-approved wash protocol',
      categories: [
        {
          name: 'Pre-Wash Products',
          items: [
            { id: 'foam-cannon', text: 'Foam Cannon', brand: 'MTM Hydro', notes: 'Professional-grade with proper dilution control' },
            { id: 'pre-wash', text: 'Pre-Wash Solution', brand: 'Frothe', notes: 'pH-neutral, high-lubricity formula' },
            { id: 'wheel-cleaner', text: 'Wheel & Tire Cleaner', brand: 'P&S Brake Buster', notes: 'Safe on all wheel finishes including carbon ceramic brakes' },
            { id: 'iron-remover', text: 'Iron Fallout Remover', brand: 'CarPro IronX', notes: 'For monthly decontamination' }
          ]
        },
        {
          name: 'Main Wash Products',
          items: [
            { id: 'shampoo', text: 'Car Shampoo', brand: 'Frothe by GoTime', notes: 'Formula specifically designed for ceramic coated vehicles' },
            { id: 'wash-mitt', text: 'Microfiber Wash Mitt', brand: 'The Rag Company', notes: '70/30 blend, deep pile' },
            { id: 'bucket-system', text: 'Two Bucket System with Grit Guards', brand: 'Detailed Image', notes: 'Color-coded to prevent cross-contamination' },
            { id: 'drying-towel', text: 'Drying Towel', brand: 'The Rag Company', notes: 'Twist Loop technology, 1100gsm minimum' }
          ]
        },
        {
          name: 'Post-Wash Products',
          items: [
            { id: 'quick-detailer', text: 'Quick Detailer', brand: 'Frothe Boost', notes: 'SiO2-infused for maintenance between washes' },
            { id: 'drying-aid', text: 'Drying Aid', brand: 'CarPro Elixir', notes: 'Adds gloss while preventing water spots' },
            { id: 'tire-dressing', text: 'Tire Dressing', brand: 'Gyeon Tire', notes: 'Water-based, satin finish that lasts' },
            { id: 'glass-cleaner', text: 'Glass Cleaner', brand: 'Stoner Invisible Glass', notes: 'Ammonia-free, streak-free formula' }
          ]
        }
      ]
    },
    {
      id: 'maintenance',
      name: 'Maintenance Protocol',
      icon: <RefreshCw className="h-5 w-5 text-green-400" />,
      description: 'Daily, weekly and monthly procedures to maintain showroom-plus condition',
      categories: [
        {
          name: 'Daily Maintenance',
          items: [
            { id: 'dust-removal', text: 'Dust Removal', brand: 'Detailed Image', notes: 'Premium microfiber dust cloth, zero pressure' },
            { id: 'quick-detailer', text: 'Quick Detailer Application', brand: 'Frothe Boost', notes: 'For water spots and light contamination' },
            { id: 'interior-wipedown', text: 'Interior Wipedown', brand: 'Gyeon Interior Detailer', notes: 'Anti-static, UV protection' },
            { id: 'glass-spot-cleaning', text: 'Glass Spot Cleaning', brand: 'Stoner Invisible Glass', notes: 'As needed for visibility' }
          ]
        },
        {
          name: 'Weekly Maintenance',
          items: [
            { id: 'wash-routine', text: 'Full Wash Routine', brand: 'Frothe System', notes: 'Two-bucket method with grit guards' },
            { id: 'tire-dressing', text: 'Tire Dressing', brand: 'Gyeon Tire', notes: 'Water-based for consistent appearance' },
            { id: 'wheel-cleaning', text: 'Wheel Deep Cleaning', brand: 'P&S Brake Buster', notes: 'With dedicated wheel brushes' },
            { id: 'trim-restoration', text: 'Exterior Trim Care', brand: 'CarPro PERL', notes: 'Diluted 1:1 for exterior plastics' }
          ]
        },
        {
          name: 'Monthly Maintenance',
          items: [
            { id: 'decontamination', text: 'Chemical Decontamination', brand: 'CarPro IronX', notes: 'Full iron fallout removal' },
            { id: 'coating-booster', text: 'Ceramic Coating Booster', brand: 'Gyeon Cure', notes: 'Maintenance for ceramic coatings' },
            { id: 'leather-treatment', text: 'Leather Deep Conditioning', brand: 'Swissvax Leather Care', notes: 'pH-balanced moisturizing' },
            { id: 'engine-bay', text: 'Engine Bay Detailing', brand: 'P&S XPress Interior Cleaner', notes: 'Diluted for engine surfaces' }
          ]
        }
      ]
    },
    {
      id: 'seasonal',
      name: 'Seasonal Adjustments',
      icon: <Calendar className="h-5 w-5 text-purple-400" />,
      description: 'Season-specific products and techniques for optimal protection',
      categories: [
        {
          name: 'Spring Protocol',
          items: [
            { id: 'spring-decon', text: 'Full Decontamination', brand: 'Multiple', notes: 'After winter chemicals/road salt exposure' },
            { id: 'spring-paint', text: 'Paint Correction Assessment', brand: 'Rupes', notes: 'Check for winter damage repair needs' },
            { id: 'spring-sealant', text: 'Sealant or Coating Renewal', brand: 'Gtechniq', notes: 'Refresh protection after winter' },
            { id: 'spring-pollen', text: 'Pollen Protection Strategy', brand: 'Gyeon', notes: 'Anti-static treatments for pollen season' }
          ]
        },
        {
          name: 'Summer Protocol',
          items: [
            { id: 'summer-uv', text: 'UV Protection Enhancement', brand: 'CarPro Reload', notes: 'Additional UV inhibitors for high sun exposure' },
            { id: 'summer-cooling', text: 'Increased Washing Frequency', brand: 'Frothe', notes: 'Prevent bug etching and water spotting' },
            { id: 'summer-interior', text: 'Interior UV Protection', brand: 'Aerospace 303', notes: 'Prevent dashboard fading and cracking' },
            { id: 'summer-glass', text: 'Glass Treatment', brand: 'Gtechniq G1', notes: 'Water repellent to improve visibility in summer storms' }
          ]
        },
        {
          name: 'Fall Protocol',
          items: [
            { id: 'fall-sealant', text: 'Winter Prep Sealant', brand: 'Gyeon Cancoat', notes: 'Durable protection before winter' },
            { id: 'fall-trim', text: 'Trim Protection Boost', brand: 'Car Pro DLUX', notes: 'Shield plastic trim from winter damage' },
            { id: 'fall-undercarriage', text: 'Undercarriage Protection', brand: 'Fluid Film', notes: 'Rust prevention before winter salt' },
            { id: 'fall-tires', text: 'Tire Protection', brand: 'Gyeon Tire', notes: 'Extra layer to prevent cracking in cold' }
          ]
        },
        {
          name: 'Winter Protocol',
          items: [
            { id: 'winter-wash', text: 'Touchless Washing', brand: 'Pressure Washer + Frothe', notes: 'Minimize paint contact in freezing temps' },
            { id: 'winter-wheels', text: 'Wheel Wax Protection', brand: 'Race Glaze Nano Wheel Sealant', notes: 'Barrier against salt and brake dust' },
            { id: 'winter-snow', text: 'Snow Foam Pre-Treatment', brand: 'Bilt Hamber Auto-Foam', notes: 'Pre-soak before touching paint' },
            { id: 'winter-interior', text: 'Interior Moisture Control', brand: 'Rechargeable Dehumidifier', notes: 'Prevent window fogging and moisture' }
          ]
        }
      ]
    }
  ];
  
  // Component Checklists for specific vehicle parts (paintwork, wheels, etc.)
  const componentChecklists = [
    {
      id: 'paint',
      name: 'Paint Treatment',
      icon: <Droplets className="h-5 w-5 text-red-400" />,
      description: 'Paint correction, protection and enhancement procedures',
      categories: [
        {
          name: 'Paint Correction',
          items: [
            { id: 'paint-wash', text: 'Prep Wash & Decontamination', brand: 'CarPro Iron-X & Tar-X', notes: 'Complete chemical decontamination' },
            { id: 'paint-clay', text: 'Clay Bar Treatment', brand: 'Bilt Hamber Auto-Clay', notes: 'Medium grade for most paint conditions' },
            { id: 'paint-compound', text: 'Compounding', brand: 'Rupes D-A Yellow Pads + Compound', notes: 'For heavy defect removal' },
            { id: 'paint-polish', text: 'Polish', brand: 'Rupes White Pads + Fine Polish', notes: 'For refining and glossing' }
          ]
        },
        {
          name: 'Paint Protection',
          items: [
            { id: 'ppf-prep', text: 'Paint Protection Film Prep', brand: 'Gtechniq Panel Wipe', notes: 'Surface must be 100% clean' },
            { id: 'ceramic-prep', text: 'Ceramic Coating Prep', brand: 'CarPro Eraser', notes: 'Oil and polish residue removal' },
            { id: 'ceramic-base', text: 'Ceramic Base Coat', brand: 'Gtechniq Crystal Serum Ultra', notes: 'Professional-only 9H hardness' },
            { id: 'ceramic-top', text: 'Ceramic Top Coat', brand: 'Gtechniq EXO v4', notes: 'Hydrophobic layer over base coating' }
          ]
        }
      ]
    },
    {
      id: 'wheels',
      name: 'Wheel & Tire',
      icon: <RefreshCw className="h-5 w-5 text-yellow-400" />,
      description: 'Wheel and tire cleaning, protection and maintenance',
      categories: [
        {
          name: 'Wheel Care',
          items: [
            { id: 'wheel-clean', text: 'Deep Wheel Cleaning', brand: 'P&S Brake Buster', notes: 'pH-balanced for all wheel finishes' },
            { id: 'wheel-iron', text: 'Iron Decontamination', brand: 'CarPro Iron-X', notes: 'For embedded brake dust removal' },
            { id: 'wheel-protect', text: 'Wheel Sealant', brand: 'Gyeon Q²M Rim', notes: '6-9 month protection from brake dust' },
            { id: 'caliper-detail', text: 'Caliper Detailing', brand: 'Adam\'s In & Out Spray', notes: 'For maintaining painted calipers' }
          ]
        },
        {
          name: 'Tire Care',
          items: [
            { id: 'tire-clean', text: 'Tire Cleaning', brand: 'Meguiar\'s Super Degreaser', notes: 'Diluted 4:1 to remove old dressings' },
            { id: 'tire-scrub', text: 'Tire Scrubbing', brand: 'Tuf Shine Tire Brush', notes: 'Stiff bristles for sidewall cleaning' },
            { id: 'tire-dress', text: 'Tire Dressing', brand: 'Gyeon Q²M Tire', notes: 'Water-based for satin finish' },
            { id: 'tire-buff', text: 'Dressing Buffing', brand: 'Microfiber Applicator', notes: 'Prevent sling and ensure even coverage' }
          ]
        }
      ]
    },
    {
      id: 'interior',
      name: 'Interior',
      icon: <Droplets className="h-5 w-5 text-blue-400" />,
      description: 'Interior cleaning, protection and revitalization',
      categories: [
        {
          name: 'Leather Care',
          items: [
            { id: 'leather-vac', text: 'Vacuum & Surface Prep', brand: 'Detail Factory Brushes', notes: 'Soft bristles for leather surfaces' },
            { id: 'leather-clean', text: 'Leather Cleaner', brand: 'Colourlock Mild Leather Cleaner', notes: 'pH-balanced for fine leather' },
            { id: 'leather-protect', text: 'Leather Protection', brand: 'Colourlock Leather Shield', notes: 'UV and stain protection' },
            { id: 'leather-feed', text: 'Leather Conditioning', brand: 'Swissvax Leather Milk', notes: 'Natural oils replenishment' }
          ]
        },
        {
          name: 'Surface Care',
          items: [
            { id: 'dash-clean', text: 'Dashboard Cleaning', brand: 'P&S Interior Cleaner', notes: 'Safe on all interior surfaces' },
            { id: 'alcantara', text: 'Alcantara Treatment', brand: 'Sonax Alcantara Cleaner', notes: 'With specialized brush' },
            { id: 'carbon-fiber', text: 'Carbon Fiber Cleaning', brand: 'CarPro MultiX', notes: 'Safe for carbon fiber trim' },
            { id: 'glass-interior', text: 'Interior Glass', brand: 'Stoner Invisible Glass', notes: 'Streak-free formula' }
          ]
        }
      ]
    }
  ];
  
  // Technical Checklists for maintenance and performance
  const technicalChecklists = [
    {
      id: 'fluid',
      name: 'Fluid Checks',
      icon: <Droplets className="h-5 w-5 text-green-400" />,
      description: 'Essential fluid inspections and maintenance',
      categories: [
        {
          name: 'Engine Fluids',
          items: [
            { id: 'oil-check', text: 'Oil Level Check', brand: 'Factory Spec', notes: 'Warm engine, level surface, wait 5 minutes after shutdown' },
            { id: 'oil-condition', text: 'Oil Condition Inspection', brand: 'Factory Spec', notes: 'Check color and consistency' },
            { id: 'coolant-check', text: 'Coolant Level Check', brand: 'Factory Spec', notes: 'Only when engine is cool' },
            { id: 'coolant-test', text: 'Coolant Freeze Point Test', brand: 'OEM Test Strips', notes: 'Ensure proper ethylene glycol mixture' }
          ]
        },
        {
          name: 'Transmission & Brakes',
          items: [
            { id: 'trans-level', text: 'Transmission Fluid Level', brand: 'Factory Spec', notes: 'Follow specific model procedure exactly' },
            { id: 'trans-condition', text: 'Transmission Fluid Condition', brand: 'Factory Spec', notes: 'Check color and smell' },
            { id: 'brake-level', text: 'Brake Fluid Level', brand: 'Factory Spec', notes: 'Between min/max marks on reservoir' },
            { id: 'brake-moisture', text: 'Brake Fluid Moisture Test', brand: 'Factory Spec', notes: 'Use electronic brake fluid tester' }
          ]
        }
      ]
    },
    {
      id: 'battery',
      name: 'Battery Care',
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
      description: 'Battery maintenance and testing procedures',
      categories: [
        {
          name: 'Battery Testing',
          items: [
            { id: 'bat-voltage', text: 'Resting Voltage Test', brand: 'CTEK Digital Tester', notes: 'Minimum 12.6V after sitting overnight' },
            { id: 'bat-load', text: 'Load Test', brand: 'Professional Load Tester', notes: 'Check capacity under simulated load' },
            { id: 'bat-charging', text: 'Charging System Test', brand: 'Factory Spec', notes: '13.8-14.2V at idle, 1500-2000 RPM' },
            { id: 'bat-drain', text: 'Parasitic Draw Test', brand: 'Digital Multimeter', notes: 'Less than 50mA draw when off' }
          ]
        },
        {
          name: 'Battery Maintenance',
          items: [
            { id: 'bat-clean', text: 'Terminal Cleaning', brand: 'CRC Battery Cleaner', notes: 'Neutralize acid and prevent corrosion' },
            { id: 'bat-protect', text: 'Terminal Protection', brand: 'NOCO NCP2', notes: 'Apply anti-corrosion spray to terminals' },
            { id: 'bat-secure', text: 'Battery Securing', brand: 'Factory Spec', notes: 'Check hold-down bracket tightness' },
            { id: 'bat-maintainer', text: 'Battery Maintainer', brand: 'CTEK MXS 5.0', notes: 'For vehicles stored more than 2 weeks' }
          ]
        }
      ]
    }
  ];
  
  // All available checklists
  const allChecklists = [
    ...detailingChecklists,
    ...componentChecklists,
    ...technicalChecklists
  ];
  
  // Initialize the completedItems state and load user checklists
  useEffect(() => {
    const initialCompletedItems = {};
    
    allChecklists.forEach(checklist => {
      checklist.categories.forEach(category => {
        category.items.forEach(item => {
          initialCompletedItems[item.id] = false;
        });
      });
    });
    
    setCompletedItems(initialCompletedItems);
    
    // Load custom checklists from localStorage if available
    const savedChecklists = localStorage.getItem('juiceBoxCustomChecklists');
    if (savedChecklists) {
      try {
        const parsed = JSON.parse(savedChecklists);
        setUserCreatedLists(parsed);
      } catch (error) {
        console.error('Error loading custom checklists:', error);
      }
    }
    
    // Load completed items from localStorage if available
    const savedCompletedItems = localStorage.getItem('juiceBoxCompletedItems');
    if (savedCompletedItems) {
      try {
        const parsed = JSON.parse(savedCompletedItems);
        setCompletedItems(prev => ({...prev, ...parsed}));
      } catch (error) {
        console.error('Error loading completed items:', error);
      }
    }
  }, []);
  
  // Save completed items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('juiceBoxCompletedItems', JSON.stringify(completedItems));
  }, [completedItems]);
  
  // Save custom checklists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('juiceBoxCustomChecklists', JSON.stringify(userCreatedLists));
  }, [userCreatedLists]);
  
  // Toggle item completion
  const toggleItemCompletion = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };
  
  // Filter checklists based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredLists(allChecklists);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allChecklists.filter(checklist => {
      // Check if checklist name or description matches
      if (
        checklist.name.toLowerCase().includes(query) ||
        checklist.description.toLowerCase().includes(query)
      ) {
        return true;
      }
      
      // Check if any category or item matches
      return checklist.categories.some(category => {
        if (category.name.toLowerCase().includes(query)) {
          return true;
        }
        
        return category.items.some(item => 
          item.text.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          (item.notes && item.notes.toLowerCase().includes(query))
        );
      });
    });
    
    setFilteredLists(filtered);
  }, [searchQuery]);
  
  // Get active checklist data
  const getActiveChecklistData = () => {
    return filteredLists.find(checklist => checklist.id === activeChecklist) || filteredLists[0];
  };
  
  // Calculate completion percentage for a checklist
  const calculateCompletion = (checklist) => {
    let totalItems = 0;
    let completedCount = 0;
    
    checklist.categories.forEach(category => {
      category.items.forEach(item => {
        totalItems++;
        if (completedItems[item.id]) {
          completedCount++;
        }
      });
    });
    
    return totalItems === 0 ? 0 : Math.round((completedCount / totalItems) * 100);
  };
  
  // Add a new custom item to a category
  const addCustomItem = (categoryName) => {
    if (!newItem.text || !newItem.brand) {
      alert("Please enter at least item name and brand");
      return;
    }
    
    const updatedLists = [...userCreatedLists];
    const activeListIndex = updatedLists.findIndex(list => list.id === activeChecklist);
    
    if (activeListIndex === -1) {
      // If this is a system checklist, create a custom clone first
      const systemList = allChecklists.find(list => list.id === activeChecklist);
      if (!systemList) return;
      
      const customListId = `custom-${systemList.id}-${Date.now()}`;
      const newCustomList = {
        ...systemList,
        id: customListId,
        isCustom: true,
        name: `Custom: ${systemList.name}`,
        description: `Your customized version of ${systemList.name}`
      };
      
      // Find the category and add the item
      const categoryIndex = newCustomList.categories.findIndex(cat => cat.name === categoryName);
      if (categoryIndex !== -1) {
        const newItemId = `custom-item-${Date.now()}`;
        newCustomList.categories[categoryIndex].items.push({
          id: newItemId,
          text: newItem.text,
          brand: newItem.brand,
          notes: newItem.notes
        });
      }
      
      setUserCreatedLists([...userCreatedLists, newCustomList]);
      setActiveChecklist(customListId);
      
    } else {
      // Add to existing custom list
      const categoryIndex = updatedLists[activeListIndex].categories.findIndex(cat => cat.name === categoryName);
      if (categoryIndex !== -1) {
        const newItemId = `custom-item-${Date.now()}`;
        updatedLists[activeListIndex].categories[categoryIndex].items.push({
          id: newItemId,
          text: newItem.text,
          brand: newItem.brand,
          notes: newItem.notes
        });
        setUserCreatedLists(updatedLists);
      }
    }
    
    // Reset form
    setNewItem({ text: '', brand: '', notes: '' });
    setShowAddItemForm(false);
  };
  
  // Add a completely new custom checklist
  const addCustomChecklist = () => {
    if (!newChecklist.name) {
      alert("Please enter at least a checklist name");
      return;
    }
    
    const customListId = `custom-list-${Date.now()}`;
    const newCustomList = {
      id: customListId,
      isCustom: true,
      name: newChecklist.name,
      description: newChecklist.description || "Custom checklist",
      icon: <Clipboard className="h-5 w-5 text-green-400" />,
      categories: [
        {
          name: "Default Category",
          items: []
        }
      ]
    };
    
    setUserCreatedLists([...userCreatedLists, newCustomList]);
    setActiveChecklist(customListId);
    setNewChecklist({ name: '', description: '', categories: [] });
    setShowAddChecklistForm(false);
  };
  
  // Remove a custom item from a checklist
  const removeCustomItem = (categoryName, itemId) => {
    const updatedLists = [...userCreatedLists];
    const activeListIndex = updatedLists.findIndex(list => list.id === activeChecklist);
    
    if (activeListIndex !== -1) {
      const categoryIndex = updatedLists[activeListIndex].categories.findIndex(cat => cat.name === categoryName);
      if (categoryIndex !== -1) {
        updatedLists[activeListIndex].categories[categoryIndex].items = 
          updatedLists[activeListIndex].categories[categoryIndex].items.filter(item => item.id !== itemId);
        setUserCreatedLists(updatedLists);
      }
    }
  };
  
  // Add new category to custom checklist
  const addCustomCategory = (checklistId, categoryName) => {
    if (!categoryName) return;
    
    const updatedLists = [...userCreatedLists];
    const listIndex = updatedLists.findIndex(list => list.id === checklistId);
    
    if (listIndex !== -1) {
      updatedLists[listIndex].categories.push({
        name: categoryName,
        items: []
      });
      setUserCreatedLists(updatedLists);
    }
  };
  
  // Check if current checklist is a custom one
  const isCustomChecklist = () => {
    return userCreatedLists.some(list => list.id === activeChecklist);
  };
  
  // Get all checklists including custom ones
  const getAllChecklists = () => {
    return [...allChecklists, ...userCreatedLists];
  };
  
  // Function to make a checklist exportable to various formats
  const exportChecklist = (format) => {
    const checklist = getAllChecklists().find(list => list.id === activeChecklist);
    if (!checklist) return;
    
    switch (format) {
      case 'csv':
        let csvContent = "Category,Item,Brand,Notes,Completed\n";
        checklist.categories.forEach(category => {
          category.items.forEach(item => {
            csvContent += `"${category.name}","${item.text}","${item.brand}","${item.notes || ''}","${completedItems[item.id] ? 'Yes' : 'No'}"\n`;
          });
        });
        
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        link.setAttribute("href", csvUrl);
        link.setAttribute("download", `${checklist.name} - JuiceBox Checklist.csv`);
        link.click();
        break;
        
      case 'print':
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>${checklist.name} - JuiceBox Checklist</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #3b82f6; }
                h2 { color: #22c55e; margin-top: 30px; }
                .item { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
                .completed { background-color: #d1fae5; }
                .brand { color: #3b82f6; font-size: 0.85em; display: inline-block; padding: 2px 8px; background: #1e3a8a22; border-radius: 4px; }
                .notes { color: #666; font-size: 0.9em; margin-top: 5px; }
              </style>
            </head>
            <body>
              <h1>${checklist.name}</h1>
              <p>${checklist.description}</p>
              ${checklist.categories.map(category => `
                <h2>${category.name}</h2>
                ${category.items.map(item => `
                  <div class="item ${completedItems[item.id] ? 'completed' : ''}">
                    <input type="checkbox" ${completedItems[item.id] ? 'checked' : ''} disabled>
                    <strong>${item.text}</strong>
                    <span class="brand">${item.brand}</span>
                    ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
                  </div>
                `).join('')}
              `).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
        break;
    }
  };

  return (
    <div className="juice-box-checklists">
      <div className="flex flex-col md:flex-row mb-6 gap-6">
        {/* Search and Filters */}
        <div className="md:w-1/3">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search checklists, products, techniques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
            />
          </div>
          
          <div className="bg-gray-900 border border-blue-500/20 rounded-xl p-4">
            <div className="flex justify-between mb-4">
              <h3 className="text-blue-400 font-orbitron text-lg">JuiceBox™ Checklists</h3>
              <button 
                onClick={() => setShowAddChecklistForm(!showAddChecklistForm)}
                className="text-green-500 hover:text-green-400"
                title="Create New Checklist"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              The curated, real-world tested, gloss-backed, Gavin-approved detailing and maintenance checklists
            </p>
            
            {showAddChecklistForm && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Create New Checklist</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Checklist Name</label>
                    <input
                      type="text"
                      value={newChecklist.name}
                      onChange={(e) => setNewChecklist({...newChecklist, name: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      placeholder="e.g., My Custom Detailing Protocol"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                    <input
                      type="text"
                      value={newChecklist.description}
                      onChange={(e) => setNewChecklist({...newChecklist, description: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      placeholder="Brief description of your checklist"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowAddChecklistForm(false)}
                      className="px-3 py-1 text-sm text-gray-300 hover:text-white mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addCustomChecklist}
                      className="px-3 py-1 text-sm bg-green-500 text-black rounded hover:bg-green-400"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 pr-1">
              {getAllChecklists().filter(list => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return list.name.toLowerCase().includes(query) || 
                       list.description.toLowerCase().includes(query);
              }).map(checklist => (
                <button
                  key={checklist.id}
                  onClick={() => setActiveChecklist(checklist.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${
                    activeChecklist === checklist.id
                      ? 'bg-green-500 bg-opacity-20 border border-green-500'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {checklist.icon}
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center">
                        {checklist.name}
                        {checklist.isCustom && (
                          <span className="ml-2 text-xs bg-blue-500 bg-opacity-30 px-1 py-0.5 rounded text-blue-300">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{checklist.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-xs font-medium text-gray-400">
                      {calculateCompletion(checklist)}% Complete
                    </div>
                    <div className="w-16 bg-gray-700 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${calculateCompletion(checklist)}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Export Options */}
          <div className="mt-4 bg-gray-900 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-blue-400 font-orbitron text-lg mb-4">Export Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportChecklist('csv')}
                className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span className="text-sm">Export CSV</span>
              </button>
              <button
                onClick={() => exportChecklist('print')}
                className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
              >
                <Clipboard className="h-4 w-4 mr-2" />
                <span className="text-sm">Print</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Checklist */}
        <div className="md:w-2/3">
          <div className="bg-gray-900 border border-blue-500/20 rounded-xl p-4">
            {getActiveChecklistData() && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getActiveChecklistData().icon}
                    <h3 className="text-blue-400 font-orbitron text-lg ml-2">
                      {getActiveChecklistData().name}
                    </h3>
                    {getActiveChecklistData().isCustom && (
                      <span className="ml-2 text-xs bg-blue-500 bg-opacity-30 px-2 py-0.5 rounded text-blue-300">
                        Custom
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className={`p-1.5 rounded-md mr-2 ${
                        editMode ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                      title={editMode ? "Save Changes" : "Edit Checklist"}
                    >
                      {editMode ? <Save size={18} /> : <Edit size={18} />}
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-6">
                  {getActiveChecklistData().description}
                </p>
                
                <div className="space-y-6">
                  {getActiveChecklistData().categories.map((category, index) => (
                    <div key={index} className="category">
                      <div 
                        className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2"
                      >
                        <button
                          onClick={() => toggleCategory(category.name)}
                          className="flex-grow text-left flex items-center"
                        >
                          <span className="text-white font-medium">{category.name}</span>
                          <span className="ml-2">
                            {expandedCategory === category.name ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </span>
                        </button>
                        
                        {editMode && isCustomChecklist() && (
                          <button
                            onClick={() => {
                              setShowAddItemForm(!showAddItemForm);
                              setExpandedCategory(category.name);
                            }}
                            className="p-1 ml-2 text-green-500 hover:text-green-400"
                            title="Add Item"
                          >
                            <Plus size={18} />
                          </button>
                        )}
                      </div>
                      
                      {expandedCategory === category.name && showAddItemForm && (
                        <div className="mb-3 p-3 bg-gray-800 rounded-lg ml-3">
                          <h4 className="text-white text-sm font-medium mb-2">Add New Item</h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-400 block mb-1">Product/Step Name</label>
                              <input
                                type="text"
                                value={newItem.text}
                                onChange={(e) => setNewItem({...newItem, text: e.target.value})}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white text-sm"
                                placeholder="e.g., Clay Bar Treatment"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 block mb-1">Brand/Product</label>
                              <input
                                type="text"
                                value={newItem.brand}
                                onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white text-sm"
                                placeholder="e.g., Bilt Hamber Auto-Clay"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 block mb-1">Notes</label>
                              <input
                                type="text"
                                value={newItem.notes}
                                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white text-sm"
                                placeholder="e.g., Medium grade for most paint conditions"
                              />
                            </div>
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => setShowAddItemForm(false)}
                                className="px-3 py-1 text-xs text-gray-300 hover:text-white mr-2"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => addCustomItem(category.name)}
                                className="px-3 py-1 text-xs bg-green-500 text-black rounded hover:bg-green-400"
                              >
                                Add Item
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {(expandedCategory === category.name || expandedCategory === null) && (
                        <div className="space-y-2 ml-3">
                          {category.items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                completedItems[item.id]
                                  ? 'bg-green-900 bg-opacity-20 border border-green-500'
                                  : 'bg-gray-800'
                              }`}
                            >
                              <div className="flex items-start">
                                <button
                                  onClick={() => toggleItemCompletion(item.id)}
                                  className="flex-shrink-0 mt-0.5 mr-3"
                                >
                                  {completedItems[item.id] ? (
                                    <CheckSquare className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-500" />
                                  )}
                                </button>
                                
                                <div className="flex-grow">
                                  <div className="text-white font-medium">{item.text}</div>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-400 bg-blue-900 bg-opacity-30 px-2 py-0.5 rounded">
                                      {item.brand}
                                    </span>
                                    {item.notes && (
                                      <span className="text-xs text-gray-400 ml-2">
                                        {item.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {editMode && isCustomChecklist() && (
                                  <button
                                    onClick={() => removeCustomItem(category.name, item.id)}
                                    className="p-1 text-red-500 hover:text-red-400 flex-shrink-0 ml-2"
                                    title="Remove Item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                
                                <Info className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2 cursor-help" />
                              </div>
                            </div>
                          ))}
                          
                          {category.items.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No items in this category yet.
                              {editMode && isCustomChecklist() && (
                                <button
                                  onClick={() => {
                                    setShowAddItemForm(true);
                                    setExpandedCategory(category.name);
                                  }}
                                  className="ml-2 text-green-500 hover:underline"
                                >
                                  Add your first item
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {editMode && isCustomChecklist() && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          const categoryName = prompt("Enter new category name:");
                          if (categoryName) {
                            addCustomCategory(activeChecklist, categoryName);
                          }
                        }}
                        className="w-full p-2 border border-dashed border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:bg-opacity-10"
                      >
                        + Add New Category
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between">
                  <div className="text-gray-400">
                    <span className="text-white font-medium">{calculateCompletion(getActiveChecklistData())}%</span> completed
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        // Reset all items in this checklist
                        const newCompletedItems = { ...completedItems };
                        getActiveChecklistData().categories.forEach(category => {
                          category.items.forEach(item => {
                            newCompletedItems[item.id] = false;
                          });
                        });
                        setCompletedItems(newCompletedItems);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      Reset Checklist
                    </button>
                    
                    {isCustomChecklist() && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this custom checklist?")) {
                            const updatedLists = userCreatedLists.filter(list => list.id !== activeChecklist);
                            setUserCreatedLists(updatedLists);
                            setActiveChecklist(getAllChecklists()[0]?.id || "wash");
                          }
                        }}
                        className="ml-4 text-red-500 hover:text-red-400"
                      >
                        Delete Checklist
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Missing components needed for rendering
const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronUp = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

export default JuiceBoxChecklists;