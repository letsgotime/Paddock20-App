import React, { useState, useEffect } from 'react';
import {
  Wrench, Zap, Sparkles, Compass, FileVideo, Briefcase, 
  Plus, ChevronRight, Share2, BookOpen, Clock, Calendar,
  Car, ChevronDown, PlayCircle, Download, ExternalLink,
  Hourglass, StepForward, CheckSquare, Star, Package, MessageSquare
} from 'lucide-react';
import { Link } from 'wouter';
// Import our mock Supabase client
import supabase from '../services/supabaseClient';

interface VideoResource {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url?: string;
  duration?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured?: boolean;
  created_at: string;
  author?: string;
  views?: number;
  related_products?: string[];
}

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'modification' | 'detailing' | 'dream' | 'other';
  estimated_hours?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'professional';
  recommended_tools?: string[];
  recommended_products?: string[];
  steps?: {
    step_number: number;
    title: string;
    description: string;
    estimated_time?: string;
    tools_needed?: string[];
    products_needed?: string[];
    images?: string[];
    video_url?: string;
  }[];
  related_videos?: string[];
  compatible_vehicles?: string[];
  created_at: string;
  author?: string;
  community_rating?: number;
  completed_count?: number;
}

interface JuiceBoxCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  video_count: number;
}

interface GarageProjectLauncherProps {
  vehicleId: string;
  isPaddock20Member?: boolean;
  onStartProject?: (projectId: string, projectType: string) => void;
}

const GarageProjectLauncher: React.FC<GarageProjectLauncherProps> = ({
  vehicleId,
  isPaddock20Member = false,
  onStartProject
}) => {
  const [activeTab, setActiveTab] = useState<string>('maintenance');
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<VideoResource[]>([]);
  const [juiceBoxCategories, setJuiceBoxCategories] = useState<JuiceBoxCategory[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project templates from Supabase
        const { data: templateData, error: templateError } = await supabase
          .from('project_templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (templateError) throw templateError;
        setProjectTemplates(templateData || []);
        
        // Fetch featured videos from Supabase
        const { data: videoData, error: videoError } = await supabase
          .from('training_videos')
          .select('*')
          .eq('featured', true)
          .limit(6);
        
        if (videoError) throw videoError;
        setFeaturedVideos(videoData || []);
        
        // Fetch JuiceBox categories from Supabase
        const { data: categoryData, error: categoryError } = await supabase
          .from('juicebox_categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (categoryError) throw categoryError;
        setJuiceBoxCategories(categoryData || []);
        
        // Fetch recent projects for this vehicle
        const { data: projectData, error: projectError } = await supabase
          .from('vehicle_projects')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (projectError) throw projectError;
        setRecentProjects(projectData || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [vehicleId]);
  
  // Start a new project
  const startProject = async (templateId: string, category: string) => {
    try {
      // Create a new project record in Supabase
      const { data, error } = await supabase
        .from('vehicle_projects')
        .insert([
          {
            vehicle_id: vehicleId,
            template_id: templateId,
            category,
            status: 'in_progress',
            start_date: new Date().toISOString(),
            created_by: 'current-user', // This would be the actual user ID
          }
        ])
        .select();
      
      if (error) throw error;
      
      if (onStartProject && data && data.length > 0) {
        onStartProject(data[0].id, category);
      }
      
      // Navigate to the project page
      window.location.href = `/projects/${data?.[0]?.id}`;
    } catch (err) {
      console.error('Error starting project:', err);
      alert('Failed to start project. Please try again.');
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      case 'modification':
        return <Zap className="h-5 w-5" />;
      case 'detailing':
        return <Sparkles className="h-5 w-5" />;
      case 'dream':
        return <Compass className="h-5 w-5" />;
      case 'juicebox':
        return <FileVideo className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };
  
  // Render maintenance project templates
  const renderMaintenanceTemplates = () => {
    const maintenanceTemplates = projectTemplates.filter(
      template => template.category === 'maintenance'
    );
    
    if (maintenanceTemplates.length === 0) {
      return (
        <div className="text-center py-6">
          <Wrench className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No maintenance templates available</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceTemplates.map(template => (
          <div 
            key={template.id}
            className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
            onClick={() => startProject(template.id, 'maintenance')}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md font-medium text-gray-200">{template.title}</h3>
              <div className={`px-2 py-0.5 text-xs rounded-full ${
                template.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                template.difficulty === 'medium' ? 'bg-blue-900/30 text-blue-400' :
                template.difficulty === 'hard' ? 'bg-amber-900/30 text-amber-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {template.difficulty}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {template.estimated_hours ? `~${template.estimated_hours} hrs` : 'Time varies'}
              </div>
              
              <button className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                Start Project
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render modification project templates
  const renderModificationTemplates = () => {
    const modificationTemplates = projectTemplates.filter(
      template => template.category === 'modification'
    );
    
    if (modificationTemplates.length === 0) {
      return (
        <div className="text-center py-6">
          <Zap className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No modification templates available</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modificationTemplates.map(template => (
          <div 
            key={template.id}
            className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
            onClick={() => startProject(template.id, 'modification')}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md font-medium text-gray-200">{template.title}</h3>
              <div className={`px-2 py-0.5 text-xs rounded-full ${
                template.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                template.difficulty === 'medium' ? 'bg-blue-900/30 text-blue-400' :
                template.difficulty === 'hard' ? 'bg-amber-900/30 text-amber-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {template.difficulty}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {template.estimated_hours ? `~${template.estimated_hours} hrs` : 'Time varies'}
              </div>
              
              <button className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                Start Project
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render detailing project templates
  const renderDetailingTemplates = () => {
    const detailingTemplates = projectTemplates.filter(
      template => template.category === 'detailing'
    );
    
    if (detailingTemplates.length === 0) {
      return (
        <div className="text-center py-6">
          <Sparkles className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No detailing templates available</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detailingTemplates.map(template => (
          <div 
            key={template.id}
            className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
            onClick={() => startProject(template.id, 'detailing')}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md font-medium text-gray-200">{template.title}</h3>
              <div className={`px-2 py-0.5 text-xs rounded-full ${
                template.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                template.difficulty === 'medium' ? 'bg-blue-900/30 text-blue-400' :
                template.difficulty === 'hard' ? 'bg-amber-900/30 text-amber-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {template.difficulty}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {template.estimated_hours ? `~${template.estimated_hours} hrs` : 'Time varies'}
              </div>
              
              <button className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                Start Project
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render dream asset project templates
  const renderDreamTemplates = () => {
    const dreamTemplates = projectTemplates.filter(
      template => template.category === 'dream'
    );
    
    if (dreamTemplates.length === 0) {
      return (
        <div className="text-center py-6">
          <Compass className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No dream asset templates available</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dreamTemplates.map(template => (
          <div 
            key={template.id}
            className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
            onClick={() => startProject(template.id, 'dream')}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md font-medium text-gray-200">{template.title}</h3>
            </div>
            
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Compass className="h-4 w-4 mr-1" />
                Dream Asset
              </div>
              
              <button className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                Start Project
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render JuiceBox training videos and categories
  const renderJuiceBox = () => {
    return (
      <div>
        {/* Featured videos */}
        {featuredVideos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-200 mb-3 flex items-center">
              <PlayCircle className="h-4 w-4 mr-1.5 text-blue-400" />
              Featured Training Videos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredVideos.map(video => (
                <div 
                  key={video.id}
                  className="bg-gray-900/60 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-800/50 transition-colors cursor-pointer"
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <div className="relative aspect-video">
                    <img 
                      src={video.thumbnail_url || 'https://via.placeholder.com/320x180?text=Video'} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                    
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-xs text-white rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-300 line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{video.description}</p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        {video.category}
                      </div>
                      
                      <div className={`px-1.5 py-0.5 text-xs rounded-full ${
                        video.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                        video.difficulty === 'intermediate' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-amber-900/30 text-amber-400'
                      }`}>
                        {video.difficulty}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-right mt-2">
              <Link href="/juicebox/videos" className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center">
                View All Videos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
        
        {/* JuiceBox Categories */}
        <div>
          <h3 className="text-md font-medium text-gray-200 mb-3 flex items-center">
            <Package className="h-4 w-4 mr-1.5 text-blue-400" />
            JuiceBox Categories
          </h3>
          
          <div className="space-y-2">
            {juiceBoxCategories.map(category => (
              <div key={category.id} className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-800/30"
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                >
                  <div className="flex items-center">
                    <div className="p-1.5 bg-gray-800 rounded-md mr-3">
                      {/* Use dynamic icon based on category.icon string */}
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">{category.name}</h4>
                      <p className="text-xs text-gray-500">{category.video_count} videos</p>
                    </div>
                  </div>
                  
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${
                    expandedCategory === category.id ? 'transform rotate-180' : ''
                  }`} />
                </div>
                
                {expandedCategory === category.id && (
                  <div className="px-4 pb-3 pt-1 border-t border-gray-800">
                    <p className="text-sm text-gray-400 mb-3">{category.description}</p>
                    
                    <div className="flex justify-between">
                      <Link 
                        href={`/juicebox/category/${category.id}`} 
                        className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center"
                      >
                        Browse Category
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                      
                      {isPaddock20Member && (
                        <button className="text-sm text-amber-400 hover:text-amber-300 inline-flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Download All
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render recent projects for this vehicle
  const renderRecentProjects = () => {
    if (recentProjects.length === 0) return null;
    
    return (
      <div className="mb-6 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <h3 className="text-md font-medium text-gray-200 mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-1.5 text-blue-400" />
          Recent Projects
        </h3>
        
        <div className="space-y-2">
          {recentProjects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/80 transition-colors"
            >
              <div className="flex items-center">
                <div className="p-1.5 rounded-md mr-2 bg-gray-800">
                  {getCategoryIcon(project.category)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">{project.title || 'Untitled Project'}</div>
                  <div className="text-xs text-gray-500">
                    Started: {new Date(project.start_date).toLocaleDateString()}
                    {project.status === 'completed' && project.completion_date && ` • Completed: ${new Date(project.completion_date).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
              
              <div className={`px-2 py-0.5 text-xs rounded-full ${
                project.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' :
                project.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                project.status === 'paused' ? 'bg-amber-900/30 text-amber-400' :
                'bg-gray-800 text-gray-400'
              }`}>
                {project.status === 'in_progress' ? 'In Progress' :
                 project.status === 'completed' ? 'Completed' :
                 project.status === 'paused' ? 'Paused' : 'Unknown'}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-3 text-right">
          <Link href={`/projects?vehicle=${vehicleId}`} className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center">
            View All Projects
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    );
  };

  // Main render method
  return (
    <div className={`bg-gray-900/40 rounded-xl p-5 border ${
      isPaddock20Member 
        ? 'border-amber-500/30 bg-gradient-to-br from-gray-900 to-gray-900/80'
        : 'border-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <StepForward className={`h-6 w-6 mr-2 ${
            isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
          }`} />
          Launch New Project
        </h2>
        
        {isPaddock20Member && (
          <div className="text-xs px-3 py-1 bg-amber-900/30 text-amber-400 rounded-full border border-amber-500/30 flex items-center">
            <Star className="h-3.5 w-3.5 mr-1" />
            PADDOCK20 EXCLUSIVE CONTENT AVAILABLE
          </div>
        )}
      </div>
      
      {/* Recent projects summary if available */}
      {renderRecentProjects()}
      
      {/* Create custom project button */}
      <div className="mb-6">
        <button
          onClick={() => window.location.href = `/projects/new?vehicle=${vehicleId}`}
          className={`w-full py-3 ${
            isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md flex items-center justify-center`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Custom Project
        </button>
      </div>
      
      {/* Project type tabs */}
      <div className="border-b border-gray-800 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button
            className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${
              activeTab === 'maintenance' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('maintenance')}
          >
            <div className="flex items-center">
              <Wrench className="h-4 w-4 mr-1.5" />
              Maintenance
            </div>
          </button>
          
          <button
            className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${
              activeTab === 'modification' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('modification')}
          >
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1.5" />
              Modifications
            </div>
          </button>
          
          <button
            className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${
              activeTab === 'detailing' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('detailing')}
          >
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Detailing
            </div>
          </button>
          
          <button
            className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${
              activeTab === 'dream' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('dream')}
          >
            <div className="flex items-center">
              <Compass className="h-4 w-4 mr-1.5" />
              Dream Assets
            </div>
          </button>
          
          <button
            className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${
              activeTab === 'juicebox' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('juicebox')}
          >
            <div className="flex items-center">
              <FileVideo className="h-4 w-4 mr-1.5" />
              JuiceBox
            </div>
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="py-10 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-400">Loading project templates...</p>
        </div>
      ) : (
        /* Content based on active tab */
        <div>
          {activeTab === 'maintenance' && renderMaintenanceTemplates()}
          {activeTab === 'modification' && renderModificationTemplates()}
          {activeTab === 'detailing' && renderDetailingTemplates()}
          {activeTab === 'dream' && renderDreamTemplates()}
          {activeTab === 'juicebox' && renderJuiceBox()}
        </div>
      )}
      
      {/* Community resources & assistance */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-200">Community & Support</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Share2 className="h-4 w-4 mr-1.5 text-blue-400" />
              Community Projects
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Browse projects shared by other enthusiasts with similar vehicles
            </p>
            <Link href="/community/projects" className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center">
              View Shared Projects
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1.5 text-blue-400" />
              Expert Assistance
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Need help with your project? Connect with our experts
            </p>
            <Link href="/support/expert" className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center">
              Request Assistance
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageProjectLauncher;