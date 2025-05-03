import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  GripVertical, 
  ShoppingBag, 
  Trash2, 
  Edit, 
  Plus, 
  MoreHorizontal, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

// Define interfaces for our data structures
interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isExpanded?: boolean;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  inStock?: boolean;
  priority?: number; // For sorting within a category
}

// This is mock data for the initial state - will be replaced with real data
const initialCategories: ProductCategory[] = [
  {
    id: 'cat-1',
    name: 'Wash Products',
    isExpanded: true,
    products: [
      { 
        id: 'prod-1', 
        name: 'Premium Foam Wash',
        description: 'pH-neutral foam wash for gentle cleaning',
        price: 19.99,
        imageUrl: '/assets/products/foam-wash.jpg',
        inStock: true
      },
      { 
        id: 'prod-2', 
        name: 'Clay Bar Kit',
        description: 'Professional grade clay bar for paint decontamination',
        price: 29.99,
        imageUrl: '/assets/products/clay-bar.jpg',
        inStock: true
      },
      { 
        id: 'prod-3', 
        name: 'Microfiber Wash Mit',
        description: 'Ultra-soft microfiber wash mit',
        price: 14.99,
        imageUrl: '/assets/products/wash-mit.jpg',
        inStock: false
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Polishing Compounds',
    isExpanded: false,
    products: [
      { 
        id: 'prod-4', 
        name: 'Fine Cut Compound',
        description: 'For light paint correction and swirl removal',
        price: 24.99,
        imageUrl: '/assets/products/fine-cut-compound.jpg',
        inStock: true
      },
      { 
        id: 'prod-5', 
        name: 'Heavy Cut Compound',
        description: 'For severe paint defects and oxidation',
        price: 27.99,
        imageUrl: '/assets/products/heavy-cut-compound.jpg',
        inStock: true
      }
    ]
  },
  {
    id: 'cat-3',
    name: 'Sealants & Coatings',
    isExpanded: false,
    products: [
      { 
        id: 'prod-6', 
        name: 'Ceramic Spray Coating',
        description: 'Easy to apply ceramic protection',
        price: 39.99,
        imageUrl: '/assets/products/ceramic-spray.jpg',
        inStock: true
      },
      { 
        id: 'prod-7', 
        name: 'Graphene Wax',
        description: 'Long lasting graphene-infused wax',
        price: 49.99,
        imageUrl: '/assets/products/graphene-wax.jpg',
        inStock: true
      }
    ]
  }
];

const DraggableProductOrganizer: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Mock API call to load products - would be replaced with actual API
  useEffect(() => {
    // In a real app, you'd fetch from API:
    // const fetchProducts = async () => {
    //   try {
    //     const response = await fetch('/api/products/categories');
    //     const data = await response.json();
    //     setCategories(data);
    //   } catch (error) {
    //     console.error('Error fetching products:', error);
    //   }
    // };
    // fetchProducts();
    
    // For now, use our initial data
    setCategories(initialCategories);
  }, []);

  const onDragEnd = (result: any) => {
    const { source, destination, type } = result;

    // Dropped outside any droppable area
    if (!destination) return;

    // No change in position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // If we're dragging categories
    if (type === 'category') {
      const newCategories = [...categories];
      const [removed] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, removed);
      setCategories(newCategories);
      return;
    }

    // If we're dragging products within the same category
    if (source.droppableId === destination.droppableId) {
      const categoryIndex = categories.findIndex(
        cat => cat.id === source.droppableId
      );
      
      if (categoryIndex === -1) return;
      
      const newCategories = [...categories];
      const newProducts = [...newCategories[categoryIndex].products];
      const [removed] = newProducts.splice(source.index, 1);
      newProducts.splice(destination.index, 0, removed);
      
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        products: newProducts
      };
      
      setCategories(newCategories);
      return;
    }

    // If we're moving products between categories
    const sourceCategoryIndex = categories.findIndex(
      cat => cat.id === source.droppableId
    );
    const destCategoryIndex = categories.findIndex(
      cat => cat.id === destination.droppableId
    );
    
    if (sourceCategoryIndex === -1 || destCategoryIndex === -1) return;
    
    const newCategories = [...categories];
    const sourceProducts = [...newCategories[sourceCategoryIndex].products];
    const destProducts = [...newCategories[destCategoryIndex].products];
    
    const [removed] = sourceProducts.splice(source.index, 1);
    destProducts.splice(destination.index, 0, removed);
    
    newCategories[sourceCategoryIndex] = {
      ...newCategories[sourceCategoryIndex],
      products: sourceProducts
    };
    
    newCategories[destCategoryIndex] = {
      ...newCategories[destCategoryIndex],
      products: destProducts
    };
    
    setCategories(newCategories);
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? { ...category, isExpanded: !category.isExpanded } 
        : category
    ));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      // Here you would call the API to save the changes
      // For example:
      // await fetch('/api/products/categories', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(categories),
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      toast({
        title: "Organization Saved",
        description: "Your product layout has been updated successfully.",
        variant: "default",
        className: "bg-green-700 border-green-600",
      });
      
      setIsEditMode(false);
    } catch (error) {
      toast({
        title: "Error Saving Changes",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving product organization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/70 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-400">
          Product Organization
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`${isEditMode ? 'bg-amber-700 hover:bg-amber-800 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
          >
            {isEditMode ? (
              <>
                <Edit className="mr-1 h-4 w-4" />
                <span>Exit Edit Mode</span>
              </>
            ) : (
              <>
                <Edit className="mr-1 h-4 w-4" />
                <span>Edit Layout</span>
              </>
            )}
          </Button>
          
          {isEditMode && (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories" type="category">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-blue-900/20 rounded-lg p-1' : ''}`}
              >
                {categories.map((category, categoryIndex) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id}
                    index={categoryIndex}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-gray-800 rounded-lg overflow-hidden
                          ${snapshot.isDragging ? 'ring-2 ring-blue-500 opacity-90' : ''}
                          ${isEditMode ? 'cursor-move' : 'cursor-default'}`}
                      >
                        <div className="p-3 bg-gray-800 flex items-center justify-between">
                          <div className="flex items-center">
                            {isEditMode && (
                              <div {...provided.dragHandleProps} className="mr-2 text-gray-400">
                                <GripVertical size={20} />
                              </div>
                            )}
                            <h3 className="font-semibold text-lg text-white flex items-center">
                              <ShoppingBag size={18} className="text-blue-400 mr-2" />
                              {category.name}
                              <span className="ml-2 text-xs text-gray-400">
                                ({category.products.length} items)
                              </span>
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleCategoryExpand(category.id)}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              {category.isExpanded ? (
                                <ChevronUp size={18} className="text-gray-400" />
                              ) : (
                                <ChevronDown size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {category.isExpanded && (
                          <Droppable droppableId={category.id} type="product">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`p-3 space-y-2 border-t border-gray-700
                                  ${snapshot.isDraggingOver ? 'bg-green-900/10' : 'bg-gray-900/50'}`}
                              >
                                {category.products.map((product, productIndex) => (
                                  <Draggable
                                    key={product.id}
                                    draggableId={product.id}
                                    index={productIndex}
                                    isDragDisabled={!isEditMode}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`p-3 bg-gray-800 rounded border border-gray-700 flex items-center
                                          ${snapshot.isDragging ? 'ring-2 ring-green-500 bg-gray-700 opacity-90' : ''}
                                          ${!product.inStock ? 'opacity-60' : ''}
                                          ${isEditMode ? 'cursor-move' : 'cursor-default'}`}
                                      >
                                        {isEditMode && (
                                          <div {...provided.dragHandleProps} className="mr-3 text-gray-500">
                                            <GripVertical size={18} />
                                          </div>
                                        )}
                                        
                                        <div className="w-10 h-10 rounded bg-gray-700 mr-3 overflow-hidden flex-shrink-0">
                                          {product.imageUrl ? (
                                            <img 
                                              src={product.imageUrl} 
                                              alt={product.name} 
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                              <ShoppingBag size={16} />
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-white truncate">
                                            {product.name}
                                          </div>
                                          {product.description && (
                                            <div className="text-xs text-gray-400 truncate">
                                              {product.description}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="ml-auto pl-3 flex-shrink-0">
                                          {product.price && (
                                            <div className="font-semibold text-blue-300">
                                              ${product.price.toFixed(2)}
                                            </div>
                                          )}
                                          {!product.inStock && (
                                            <div className="text-xs text-red-400">Out of stock</div>
                                          )}
                                        </div>
                                        
                                        {isEditMode && (
                                          <button className="ml-3 p-1.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700">
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                
                                {isEditMode && (
                                  <button className="w-full mt-2 p-2 border border-dashed border-gray-600 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors">
                                    <Plus size={16} className="mr-1" />
                                    <span>Add Product</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {isEditMode && (
                  <button className="w-full p-3 border border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors">
                    <Plus size={18} className="mr-2" />
                    <span>Add Category</span>
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900/70">
        <div className="text-sm text-gray-500">
          {isEditMode ? (
            <p>Drag and drop products or categories to reorganize. Click Save when done.</p>
          ) : (
            <p>Click "Edit Layout" to reorganize products using drag and drop.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableProductOrganizer;