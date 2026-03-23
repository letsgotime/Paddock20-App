import React, { useState } from 'react';
import { 
  Phone, Headphones, Calendar, MessageCircle, Clock, Tag, 
  Gift, Shield, Mail, User, Book, Car, MapPin
} from 'lucide-react';

const services = [
  {
    id: 1,
    title: "Vehicle Acquisition",
    description: "Personal assistance in sourcing and acquiring rare or limited production vehicles. Our team works with an exclusive network of dealers and private sellers to locate your dream car.",
    icon: <Car className="h-10 w-10 text-blue-500" />,
    price: "From $2,500"
  },
  {
    id: 2,
    title: "Event Concierge",
    description: "White-glove service for automotive events worldwide. From F1 Grand Prix to exclusive auctions, we provide VIP access and handle all logistics for a seamless experience.",
    icon: <Calendar className="h-10 w-10 text-blue-500" />,
    price: "From $1,500"
  },
  {
    id: 3,
    title: "Collection Management",
    description: "Comprehensive management services for vehicle collections including maintenance scheduling, documentation, valuation, and secure storage solutions.",
    icon: <Book className="h-10 w-10 text-blue-500" />,
    price: "From $1,000/month"
  },
  {
    id: 4,
    title: "Transportation & Logistics",
    description: "Secure, insured transportation for your vehicles to events, service appointments, or between properties with real-time tracking and status updates.",
    icon: <MapPin className="h-10 w-10 text-blue-500" />,
    price: "Custom Quote"
  },
  {
    id: 5,
    title: "Restoration Consultation",
    description: "Expert guidance and project management for vehicle restoration projects, connecting you with specialized craftsmen and authenticating parts and materials.",
    icon: <Shield className="h-10 w-10 text-blue-500" />,
    price: "From $5,000"
  },
  {
    id: 6,
    title: "Membership Privileges",
    description: "Access to exclusive automotive clubs, racetracks, and private events through our extensive partner network with preferential booking and members-only rates.",
    icon: <Gift className="h-10 w-10 text-blue-500" />,
    price: "Included with Premium"
  }
];

const FAQ = [
  {
    question: "How does the P20 Concierge service work?",
    answer: "Our concierge service provides personalized assistance across all aspects of automotive lifestyle. After submitting a request, you'll be assigned a dedicated concierge specialist who will work directly with you to fulfill your needs with our signature white-glove approach."
  },
  {
    question: "Is there a limit to the number of concierge requests I can make?",
    answer: "Premium members receive unlimited concierge requests. Standard members can make up to 3 requests per month. All members receive priority response based on their membership tier."
  },
  {
    question: "How quickly can I expect a response to my concierge request?",
    answer: "Premium members receive responses within 1 hour during business hours and within 4 hours outside business hours. Standard members receive responses within 24 hours."
  },
  {
    question: "Can the concierge service help with international automotive events?",
    answer: "Absolutely. Our global network allows us to provide comprehensive concierge services for automotive events worldwide, including transportation, accommodation, and exclusive access opportunities."
  },
  {
    question: "Is there an additional fee for concierge services?",
    answer: "Basic concierge assistance is included with your membership. Premium services such as vehicle acquisition or event planning may incur additional fees which will be clearly communicated before any commitment."
  }
];

const ConciergeServicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send this to the backend
    console.log({ name, email, requestType, message });
    setSubmitted(true);
    // Reset form
    setName('');
    setEmail('');
    setRequestType('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-500 mb-4 font-orbitron">P20 Concierge Services</h1>
          <p className="text-gray-300 max-w-3xl mx-auto mb-8">
            Exceptional personal service for every aspect of your automotive lifestyle.
            Our dedicated concierge team delivers white-glove assistance tailored to your specific needs.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              className={`px-6 py-3 rounded-md transition-all duration-300 ${activeTab === 'services' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('services')}
            >
              Our Services
            </button>
            <button 
              className={`px-6 py-3 rounded-md transition-all duration-300 ${activeTab === 'request' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('request')}
            >
              Request Assistance
            </button>
            <button 
              className={`px-6 py-3 rounded-md transition-all duration-300 ${activeTab === 'faq' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('faq')}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {activeTab === 'services' && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-500 mb-4">Premium Concierge Services</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our concierge team specializes in meeting the unique needs of automotive enthusiasts
              with personalized service and exclusive access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-all shadow-lg">
                <div className="mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-blue-400 font-semibold">{service.price}</span>
                  <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors">
                    Request Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-gray-900 to-black p-8 rounded-lg border border-gray-800">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h3 className="text-2xl font-bold text-white mb-4">Personalized Automotive Assistance</h3>
                <p className="text-gray-300 mb-6">
                  Beyond our standard services, our concierge team is ready to assist with any automotive need.
                  From sourcing rare parts to coordinating specialty services, we leverage our extensive network
                  to deliver exceptional results.
                </p>
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">24/7 Availability</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Global Network</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Discreet Service</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Dedicated Specialist</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <Headphones className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Priority Support</h4>
                    <p className="text-gray-400 text-sm">Direct line to your dedicated concierge</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Quick Response</h4>
                    <p className="text-gray-400 text-sm">1-hour response for premium members</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <Tag className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Special Access</h4>
                    <p className="text-gray-400 text-sm">Exclusive events and opportunities</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Personal Touch</h4>
                    <p className="text-gray-400 text-sm">Customized to your preferences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Form */}
      {activeTab === 'request' && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-500 mb-4">Request Concierge Assistance</h2>
              <p className="text-gray-300">
                Submit your request below and a dedicated concierge specialist will contact you
                to discuss your needs in detail.
              </p>
            </div>

            {submitted ? (
              <div className="bg-gradient-to-r from-green-900 to-green-800 p-8 rounded-lg text-center">
                <div className="inline-block p-3 bg-green-700 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Submitted Successfully</h3>
                <p className="text-gray-200 mb-6">
                  Your concierge request has been received. A dedicated specialist will contact you shortly to assist with your needs.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-lg border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-gray-800 text-white rounded-md py-3 pl-10 pr-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-800 text-white rounded-md py-3 pl-10 pr-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="requestType" className="block text-gray-300 mb-2">Request Type</label>
                  <select
                    id="requestType"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="bg-gray-800 text-white rounded-md py-3 px-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="acquisition">Vehicle Acquisition</option>
                    <option value="event">Event Concierge</option>
                    <option value="collection">Collection Management</option>
                    <option value="transport">Transportation & Logistics</option>
                    <option value="restoration">Restoration Consultation</option>
                    <option value="membership">Membership Privileges</option>
                    <option value="other">Other Request</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-300 mb-2">Request Details</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-800 text-white rounded-md py-3 px-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                    rows={6}
                    placeholder="Please provide specific details about your request..."
                    required
                  ></textarea>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-sm">
                    <Clock className="inline-block h-4 w-4 mr-1" />
                    Premium members receive priority response within 1 hour
                  </div>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg text-center border border-gray-800">
                <Phone className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Direct Contact</h3>
                <p className="text-gray-400">Premium members can reach us 24/7 on our dedicated line</p>
              </div>
              <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg text-center border border-gray-800">
                <MessageCircle className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">In-App Chat</h3>
                <p className="text-gray-400">Chat directly with your concierge specialist through the app</p>
              </div>
              <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg text-center border border-gray-800">
                <Mail className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                <p className="text-gray-400">Send detailed requests to concierge@paddock20.com</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-500 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about our concierge services.
              If you can't find what you're looking for, please contact us directly.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {FAQ.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-3">{item.question}</h3>
                  <p className="text-gray-400">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-300 mb-6">
                Still have questions about our concierge services?
                Our team is ready to assist you with any inquiries.
              </p>
              <button
                onClick={() => setActiveTab('request')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Contact Concierge Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-500 mb-4">Member Experiences</h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Hear from Paddock20 members who have used our concierge services
            for their automotive lifestyle needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800">
            <div className="mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-amber-400 fill-current"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 italic mb-4">
              "The concierge team sourced a rare 1967 Ferrari 275 GTB/4 for my collection that I had been searching for years. Their network and expertise made the impossible possible."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">JR</div>
              <div className="ml-3">
                <h4 className="text-white font-semibold">James R.</h4>
                <p className="text-gray-400 text-sm">Premium Member - 3 years</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800">
            <div className="mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-amber-400 fill-current"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 italic mb-4">
              "Their event concierge service secured paddock access at Monaco GP with only two weeks' notice. The entire experience was seamless from transportation to accommodations."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">SL</div>
              <div className="ml-3">
                <h4 className="text-white font-semibold">Sophie L.</h4>
                <p className="text-gray-400 text-sm">Premium Member - 2 years</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800">
            <div className="mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-amber-400 fill-current"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 italic mb-4">
              "The collection management service has transformed how I maintain my vehicles. Their documentation system and maintenance scheduling has preserved the value of my classics."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">DT</div>
              <div className="ml-3">
                <h4 className="text-white font-semibold">David T.</h4>
                <p className="text-gray-400 text-sm">Premium Member - 1 year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConciergeServicePage;