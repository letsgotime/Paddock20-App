import React, { useState } from 'react';
import { Shield, Camera, Video, Clock, Calendar, Droplets, Wrench, PlayCircle, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

// Membership tiers based on the Darth Vader project document
const MEMBERSHIP_TIERS = {
  GOAT: {
    name: 'GOAT Package',
    price: '$15,000/$20,000',
    color: 'from-blue-500 to-purple-600',
    benefits: [
      'Prime vault storage location',
      'Bi-Monthly detail video',
      'Monthly Air pressure checks',
      'Bi-annual visible vehicle condition report',
      'Annual on-site photo shoot (15 professionally edited photos)',
      '20% off Merchandise and Swag',
      'P1 Club VIP Access',
      'Free Screen ProTech screen kit'
    ]
  },
  CHAMPION: {
    name: 'Champion Package',
    price: '$12,000/$17,000',
    color: 'from-green-500 to-blue-600',
    benefits: [
      'Preferred vault location',
      'Quarterly detail video',
      'Quarterly air pressure video',
      'Bi-annual visible, non-engine seal inspection and treatment',
      'Annual visible vehicle condition report',
      'Annual on-site photo shoot (5 professionally edited photos)',
      '15% off Merchandise and Swag',
      'P1 Club Exclusive Access',
      'Free Screen ProTech screen kit'
    ]
  },
  PRO: {
    name: 'Pro Package',
    price: '$10,000/$15,000',
    color: 'from-amber-500 to-orange-600',
    benefits: [
      'Standard vault location',
      'Bi-Annual detail video',
      'Annual visible vehicle condition report',
      '10% off Merchandise and Swag',
      'P1 Club Exclusive Access',
      'Free Screen ProTech screen kit'
    ]
  },
  SOCIAL: {
    name: 'Social Member',
    price: '$5,000/$6,000',
    color: 'from-gray-500 to-gray-700',
    benefits: [
      'No vehicle storage',
      'P1 Exclusive access',
      'Member discounts',
      'Affiliate partner discounts',
      'Weekly networking access',
      'Rally access',
      'Car-show access'
    ]
  }
};

// Storage service entry component
function StorageServiceEntry({ icon: Icon, title, description, date, status, onClick }) {
  return (
    <div 
      className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-all"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="mt-1 mr-4">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
          <p className="text-gray-400 text-sm mb-3">{description}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-500">{date}</span>
            </div>
            
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              status === 'completed' ? 'bg-green-900/20 text-green-400' :
              status === 'scheduled' ? 'bg-blue-900/20 text-blue-400' :
              status === 'due' ? 'bg-amber-900/20 text-amber-400' :
              'bg-red-900/20 text-red-400'
            }`}>
              {status === 'completed' ? 'Completed' :
               status === 'scheduled' ? 'Scheduled' :
               status === 'due' ? 'Due Soon' : 'Overdue'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal for service details
function ServiceDetailsModal({ service, onClose }) {
  if (!service) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4">
      <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
              {service.icon && <service.icon className="mr-3 h-6 w-6" />}
              {service.title}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-300">{service.date}</span>
              <div className={`ml-4 px-2 py-0.5 rounded-full text-xs font-medium ${
                service.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                service.status === 'scheduled' ? 'bg-blue-900/20 text-blue-400' :
                service.status === 'due' ? 'bg-amber-900/20 text-amber-400' :
                'bg-red-900/20 text-red-400'
              }`}>
                {service.status === 'completed' ? 'Completed' :
                service.status === 'scheduled' ? 'Scheduled' :
                service.status === 'due' ? 'Due Soon' : 'Overdue'}
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">{service.description}</p>
            
            {service.notes && (
              <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-white text-sm font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-400" />
                  Service Notes
                </h3>
                <p className="text-gray-400 text-sm">{service.notes}</p>
              </div>
            )}
            
            {service.media && service.media.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-blue-400" />
                  Media Documentation
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {service.media.map((item, index) => (
                    <div key={index} className="relative group">
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.caption || 'Service documentation'} 
                          className="w-full h-32 object-cover rounded-lg border border-gray-800"
                        />
                      ) : (
                        <div className="w-full h-32 bg-black rounded-lg border border-gray-800 flex items-center justify-center relative">
                          <PlayCircle className="h-10 w-10 text-blue-400 group-hover:text-blue-300" />
                          <div className="absolute bottom-2 left-2 right-2 text-xs text-center text-gray-400">{item.caption || 'Service video'}</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">
                          {item.type === 'image' ? 'View' : 'Play'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.checklist && service.checklist.length > 0 && (
              <div>
                <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                  Service Checklist
                </h3>
                
                <ul className="space-y-2">
                  {service.checklist.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-3 ${
                        item.completed ? 'bg-green-500' : 'bg-gray-700'
                      }`}>
                        {item.completed && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${item.completed ? 'text-gray-300' : 'text-gray-400'}`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
            
            {service.status !== 'completed' && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
function VaultStorageServices({ vehicle, membershipTier = 'GOAT' }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedService, setSelectedService] = useState(null);
  const tier = MEMBERSHIP_TIERS[membershipTier] || MEMBERSHIP_TIERS.PRO;
  
  // Mock services data - in a real app, this would come from an API
  const services = {
    upcoming: [
      {
        id: 1,
        icon: Video,
        title: 'Monthly Detail Video',
        description: 'Comprehensive detail video documenting condition and cleanliness of your vehicle.',
        date: '05/15/2025',
        status: 'scheduled',
        notes: 'Our detail specialists will document the condition of your vehicle, focusing on paint quality, interior cleanliness, and overall presentation.',
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8', caption: 'Previous detail session' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1605515298946-d3f43c61a8dd', caption: 'Paint condition assessment' }
        ],
        checklist: [
          { text: 'Exterior condition documentation', completed: false },
          { text: 'Interior condition documentation', completed: false },
          { text: 'Under-hood inspection', completed: false },
          { text: 'Wheel and tire condition assessment', completed: false },
          { text: 'Recommendations for services needed', completed: false }
        ]
      },
      {
        id: 2,
        icon: Droplets,
        title: 'Air Pressure Check',
        description: 'Monthly tire pressure monitoring and adjustment to optimal levels.',
        date: '05/10/2025',
        status: 'due',
        notes: 'Our technicians will check and adjust tire pressure to manufacturer-recommended specifications based on current weather conditions.',
        checklist: [
          { text: 'Check all four tires plus spare', completed: false },
          { text: 'Adjust to optimal pressure for current temperature', completed: false },
          { text: 'Inspect for signs of uneven wear', completed: false },
          { text: 'Document tire tread depth', completed: false }
        ]
      }
    ],
    completed: [
      {
        id: 3,
        icon: Camera,
        title: 'Annual Photo Shoot',
        description: 'Professional photography session with 15 high-quality edited images of your vehicle.',
        date: '03/15/2025',
        status: 'completed',
        notes: 'Photo session completed with our professional automotive photographer. Images have been uploaded to your account gallery.',
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d', caption: 'Front 3/4 view' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c', caption: 'Rear detail shot' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', caption: 'Interior cockpit view' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f', caption: 'Wheel detail' }
        ]
      },
      {
        id: 4,
        icon: Wrench,
        title: 'Bi-annual Condition Report',
        description: 'Comprehensive vehicle inspection with detailed condition report.',
        date: '02/20/2025',
        status: 'completed',
        notes: 'Full inspection completed. Vehicle is in excellent condition with only minor notes about upcoming maintenance needs.',
        media: [
          { type: 'video', url: '#', caption: 'Full inspection video' },
        ],
        checklist: [
          { text: 'Exterior inspection', completed: true },
          { text: 'Interior inspection', completed: true },
          { text: 'Mechanical systems overview', completed: true },
          { text: 'Fluid levels check', completed: true },
          { text: 'Undercarriage inspection', completed: true },
          { text: 'Electronic systems test', completed: true }
        ]
      }
    ]
  };
  
  const handleServiceClick = (service) => {
    setSelectedService(service);
  };
  
  const handleCloseModal = () => {
    setSelectedService(null);
  };
  
  // If no vehicle data is available
  if (!vehicle) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-orbitron text-blue-400 mb-2">No Vehicle Selected</h3>
        <p className="text-gray-400">Please select a vehicle to view storage services.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-black rounded-lg">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Vault Storage Services
          </h2>
          
          <div className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${tier.color}`}>
            {tier.name}
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          Premium storage services and scheduled maintenance for your {vehicle.year} {vehicle.make} {vehicle.model}.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Video className="h-8 w-8 mx-auto text-blue-400 mb-2" />
            <h3 className="text-white text-sm">Detail Videos</h3>
            <p className="text-xs text-gray-400">{membershipTier === 'GOAT' ? 'Bi-Monthly' : membershipTier === 'CHAMPION' ? 'Quarterly' : 'Bi-Annual'}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Droplets className="h-8 w-8 mx-auto text-green-400 mb-2" />
            <h3 className="text-white text-sm">Tire Pressure</h3>
            <p className="text-xs text-gray-400">{membershipTier === 'GOAT' ? 'Monthly' : membershipTier === 'CHAMPION' ? 'Quarterly' : 'As Needed'}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Camera className="h-8 w-8 mx-auto text-purple-400 mb-2" />
            <h3 className="text-white text-sm">Photo Session</h3>
            <p className="text-xs text-gray-400">{membershipTier === 'GOAT' ? '15 Photos' : membershipTier === 'CHAMPION' ? '5 Photos' : 'Not Included'}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Clock className="h-8 w-8 mx-auto text-amber-400 mb-2" />
            <h3 className="text-white text-sm">Condition Report</h3>
            <p className="text-xs text-gray-400">{membershipTier === 'GOAT' || membershipTier === 'CHAMPION' ? 'Bi-Annual' : 'Annual'}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border border-gray-800">
          <h3 className="text-white text-sm font-medium mb-3">Membership Benefits</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex border-b border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 ${activeTab === 'upcoming' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Upcoming Services
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 ${activeTab === 'completed' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Completed Services
          </button>
        </div>
        
        <div className="space-y-4">
          {services[activeTab].length > 0 ? (
            services[activeTab].map(service => (
              <StorageServiceEntry
                key={service.id}
                icon={service.icon}
                title={service.title}
                description={service.description}
                date={service.date}
                status={service.status}
                onClick={() => handleServiceClick(service)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400">No {activeTab} services found.</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default VaultStorageServices;