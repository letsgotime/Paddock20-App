// /client/src/pages/GTGVaultGallery.tsx

import React, { useState } from "react";
import { 
  Plus, 
  Filter, 
  Image as ImageIcon, 
  Calendar, 
  Tag, 
  Download, 
  Maximize, 
  Heart,
  Grid, 
  List, 
  SlidersHorizontal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const GTGVaultGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Mock images for demonstration
  const images = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop",
      title: "Front 3/4 View",
      vehicle: "2022 Porsche 911 GT3",
      date: "April 15, 2025",
      category: "exterior",
      favorite: true
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1618843479713-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
      title: "Wheels Detail",
      vehicle: "2022 Porsche 911 GT3",
      date: "April 15, 2025",
      category: "wheels",
      favorite: false
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=2487&auto=format&fit=crop",
      title: "Interior Dashboard",
      vehicle: "2022 Porsche 911 GT3",
      date: "April 10, 2025",
      category: "interior",
      favorite: true
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=2574&auto=format&fit=crop",
      title: "Rear Wing",
      vehicle: "2022 Porsche 911 GT3",
      date: "April 8, 2025",
      category: "exterior",
      favorite: false
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?q=80&w=2070&auto=format&fit=crop",
      title: "Track Day",
      vehicle: "2022 Porsche 911 GT3",
      date: "March 25, 2025",
      category: "events",
      favorite: true
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1611859266516-31c2982c4f3a?q=80&w=2069&auto=format&fit=crop",
      title: "Side Profile",
      vehicle: "2022 Porsche 911 GT3",
      date: "March 20, 2025",
      category: "exterior",
      favorite: false
    },
    {
      id: "7",
      url: "https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?q=80&w=2070&auto=format&fit=crop",
      title: "Engine Bay",
      vehicle: "2019 BMW M4",
      date: "March 15, 2025",
      category: "engine",
      favorite: false
    },
    {
      id: "8",
      url: "https://images.unsplash.com/photo-1603146058637-13250cadd7d0?q=80&w=2070&auto=format&fit=crop",
      title: "Freshly Detailed",
      vehicle: "2019 BMW M4",
      date: "March 10, 2025",
      category: "detailing",
      favorite: true
    },
    {
      id: "9",
      url: "https://images.unsplash.com/photo-1626668893536-1e1cf9442c63?q=80&w=2072&auto=format&fit=crop",
      title: "New Wheels",
      vehicle: "2019 BMW M4",
      date: "March 5, 2025",
      category: "wheels",
      favorite: true
    }
  ];

  // Filter images based on search and category
  const filteredImages = images.filter(image => {
    const matchesSearch = searchQuery === "" || 
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      activeCategory === "favorites" && image.favorite ||
      image.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Open image detail dialog
  const openImageDetail = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          Vehicle Gallery
        </h1>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-[250px] bg-zinc-900 border-zinc-800 pl-10"
              />
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <Select 
              defaultValue="all" 
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-800 w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Photos</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
                <SelectItem value="exterior">Exterior</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="wheels">Wheels</SelectItem>
                <SelectItem value="engine">Engine</SelectItem>
                <SelectItem value="detailing">Detailing</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs 
              defaultValue="grid" 
              value={viewMode} 
              onValueChange={setViewMode}
              className="hidden md:flex"
            >
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="grid" className="px-3 data-[state=active]:bg-blue-500">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3 data-[state=active]:bg-blue-500">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full md:w-auto flex gap-2">
            <Button variant="outline" className="border-zinc-700">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Upload
            </Button>
          </div>
        </div>
        
        {/* Gallery */}
        {filteredImages.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <ImageIcon className="h-16 w-16 mx-auto text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Images Found</h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
              {searchQuery 
                ? `No images match your search for "${searchQuery}".` 
                : "There are no images in this category yet."}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-500">
              <Plus className="h-4 w-4 mr-2" /> Upload New Images
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => openImageDetail(image.url)}
              >
                <div className="aspect-square relative">
                  <img 
                    src={image.url} 
                    alt={image.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3">
                      <h3 className="font-bold text-white">{image.title}</h3>
                      <p className="text-sm text-gray-300">{image.vehicle}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 text-white hover:bg-black/70">
                      <Heart className={`h-4 w-4 ${image.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate">{image.title}</h3>
                      <p className="text-xs text-gray-400">{image.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-zinc-700 bg-zinc-800">
                      {image.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="flex items-center p-4 hover:bg-zinc-800/50 cursor-pointer"
                  onClick={() => openImageDetail(image.url)}
                >
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={image.url} 
                      alt={image.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{image.title}</h3>
                    <div className="flex text-xs text-gray-400 gap-4">
                      <span>{image.vehicle}</span>
                      <span>{image.date}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="mr-4 border-zinc-700 bg-zinc-800">
                    {image.category}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                      <Heart className={`h-4 w-4 ${image.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Image Detail Dialog */}
        <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-5xl p-0 overflow-hidden">
            <div className="relative">
              <img 
                src={selectedImage || ''} 
                alt="Selected image" 
                className="w-full object-contain max-h-[80vh]"
              />
              <DialogClose className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold">Side Profile</h3>
                  <p className="text-gray-400">2022 Porsche 911 GT3 • March 20, 2025</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-zinc-700">
                    <Heart className="h-4 w-4 mr-2" /> Favorite
                  </Button>
                  <Button variant="outline" className="border-zinc-700">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-500">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4 bg-zinc-800" />
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-zinc-800 hover:bg-zinc-700">exterior</Badge>
                <Badge className="bg-zinc-800 hover:bg-zinc-700">side</Badge>
                <Badge className="bg-zinc-800 hover:bg-zinc-700">profile</Badge>
                <Badge className="bg-zinc-800 hover:bg-zinc-700">guards red</Badge>
                <Badge className="bg-zinc-800 hover:bg-zinc-700 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Tag
                </Badge>
              </div>
              
              <div className="text-gray-400">
                <h4 className="font-medium text-white mb-1">Description:</h4>
                <p>Side profile shot of the GT3 after a fresh detail. The guards red really pops in the sunlight.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GTGVaultGallery;