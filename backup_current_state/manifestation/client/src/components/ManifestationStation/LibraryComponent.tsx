import React, { useState } from 'react';
import { Goal, GoalMedia } from '../../types/manifestation';
import { 
  Book, 
  Headphones, 
  PlusCircle, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  BookMarked, 
  Link as LinkIcon,
  Edit, 
  Save
} from 'lucide-react';

interface LibraryComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

type BookStatus = 'to-read' | 'reading' | 'completed';

interface BookEntry {
  id: number;
  title: string;
  author?: string;
  status: BookStatus;
  dateAdded: string;
  dateStarted?: string;
  dateCompleted?: string;
  notes?: string;
  audioLink?: string;
  coverImage?: string;
  isEditing?: boolean;
}

const LibraryComponent: React.FC<LibraryComponentProps> = ({ goal, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<BookStatus>('to-read');
  
  // Initialize book library if it doesn't exist in media gallery
  if (!goal.mediaGallery) {
    goal.mediaGallery = [];
  }
  
  // Find all book entries in the media gallery
  const bookEntries: BookEntry[] = goal.mediaGallery
    .filter(media => media.type === 'book' || media.type === 'audiobook')
    .map(media => {
      // Map media object to book entry
      const metadataObj = media.description ? JSON.parse(media.description) : {};
      return {
        id: media.id,
        title: media.name,
        author: metadataObj.author || '',
        status: metadataObj.status || 'to-read',
        dateAdded: media.dateAdded,
        dateStarted: metadataObj.dateStarted,
        dateCompleted: metadataObj.dateCompleted,
        notes: metadataObj.notes,
        audioLink: media.type === 'audiobook' ? media.url : metadataObj.audioLink,
        coverImage: media.thumbnail,
        isEditing: false
      };
    });
  
  // Form state for new book entry
  const [newBook, setNewBook] = useState<Omit<BookEntry, 'id' | 'dateAdded'>>({
    title: '',
    author: '',
    status: 'to-read',
    notes: '',
    audioLink: ''
  });
  
  // Ref for file upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Filter books by active tab
  const filteredBooks = bookEntries.filter(book => book.status === activeTab);
  
  // Function to add a new book
  const handleAddBook = () => {
    if (!newBook.title.trim()) return;
    
    const updatedGoal = { ...goal };
    
    // Create new media item for the book
    const newMedia: GoalMedia = {
      id: Date.now(),
      type: newBook.audioLink ? 'audiobook' : 'book',
      name: newBook.title.trim(),
      url: newBook.audioLink || '',
      dateAdded: new Date().toISOString(),
      description: JSON.stringify({
        author: newBook.author,
        status: newBook.status,
        notes: newBook.notes,
        dateStarted: newBook.status === 'reading' ? new Date().toISOString() : undefined,
        dateCompleted: newBook.status === 'completed' ? new Date().toISOString() : undefined,
      })
    };
    
    // Add to media gallery
    updatedGoal.mediaGallery.push(newMedia);
    
    // Update the goal
    onUpdate(updatedGoal);
    
    // Reset form
    setNewBook({
      title: '',
      author: '',
      status: 'to-read',
      notes: '',
      audioLink: ''
    });
  };
  
  // Function to delete a book
  const handleDeleteBook = (bookId: number) => {
    const updatedGoal = { ...goal };
    
    // Find the index of the book in media gallery
    const bookIndex = updatedGoal.mediaGallery.findIndex(media => media.id === bookId);
    
    if (bookIndex !== -1) {
      // Remove the book
      updatedGoal.mediaGallery.splice(bookIndex, 1);
      
      // Update the goal
      onUpdate(updatedGoal);
    }
  };
  
  // Function to start editing a book
  const startEditing = (bookId: number) => {
    const updatedBookEntries = bookEntries.map(book => 
      book.id === bookId ? { ...book, isEditing: true } : { ...book, isEditing: false }
    );
    
    // Update local state to reflect editing status
    bookEntries.forEach((book, index) => {
      if (book.id === bookId) {
        bookEntries[index].isEditing = true;
      } else {
        bookEntries[index].isEditing = false;
      }
    });
  };
  
  // Function to save edits to a book
  const saveBookEdits = (bookId: number, updatedData: Partial<BookEntry>) => {
    const updatedGoal = { ...goal };
    
    // Find the book in media gallery
    const mediaIndex = updatedGoal.mediaGallery.findIndex(media => media.id === bookId);
    
    if (mediaIndex !== -1) {
      const media = updatedGoal.mediaGallery[mediaIndex];
      const metadataObj = media.description ? JSON.parse(media.description) : {};
      
      // Update media properties
      updatedGoal.mediaGallery[mediaIndex].name = updatedData.title || media.name;
      updatedGoal.mediaGallery[mediaIndex].url = updatedData.audioLink || media.url;
      
      // Update metadata
      const updatedMetadata = {
        ...metadataObj,
        author: updatedData.author,
        status: updatedData.status,
        notes: updatedData.notes,
      };
      
      // Update status-related dates
      if (updatedData.status === 'reading' && metadataObj.status !== 'reading') {
        updatedMetadata.dateStarted = new Date().toISOString();
      } else if (updatedData.status === 'completed' && metadataObj.status !== 'completed') {
        updatedMetadata.dateCompleted = new Date().toISOString();
      }
      
      // Update the description field with JSON data
      updatedGoal.mediaGallery[mediaIndex].description = JSON.stringify(updatedMetadata);
      
      // Set type based on whether there's an audio link
      updatedGoal.mediaGallery[mediaIndex].type = 
        updatedData.audioLink ? 'audiobook' : 'book';
      
      // Update the goal
      onUpdate(updatedGoal);
      
      // Update local state to exit editing mode
      bookEntries.forEach((book, index) => {
        if (book.id === bookId) {
          bookEntries[index].isEditing = false;
        }
      });
    }
  };
  
  // Function to change book status (like from to-read to reading)
  const changeBookStatus = (bookId: number, newStatus: BookStatus) => {
    const updatedGoal = { ...goal };
    
    // Find the book in media gallery
    const mediaIndex = updatedGoal.mediaGallery.findIndex(media => media.id === bookId);
    
    if (mediaIndex !== -1) {
      const media = updatedGoal.mediaGallery[mediaIndex];
      const metadataObj = media.description ? JSON.parse(media.description) : {};
      
      // Update status
      metadataObj.status = newStatus;
      
      // Update status-related dates
      if (newStatus === 'reading' && !metadataObj.dateStarted) {
        metadataObj.dateStarted = new Date().toISOString();
      } else if (newStatus === 'completed' && !metadataObj.dateCompleted) {
        metadataObj.dateCompleted = new Date().toISOString();
      }
      
      // Update the description field with JSON data
      updatedGoal.mediaGallery[mediaIndex].description = JSON.stringify(metadataObj);
      
      // Update the goal
      onUpdate(updatedGoal);
    }
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl text-blue-400 font-orbitron mb-4">KNOWLEDGE LIBRARY</h3>
      
      {/* Tab navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('to-read')}
          className={`flex-1 py-2 rounded-t-lg ${activeTab === 'to-read' 
            ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <Book className="h-4 w-4 mr-1" />
            <span>To Read</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex-1 py-2 rounded-t-lg ${activeTab === 'reading' 
            ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>Reading Now</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-t-lg ${activeTab === 'completed' 
            ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <BookMarked className="h-4 w-4 mr-1" />
            <span>Completed</span>
          </div>
        </button>
      </div>
      
      {/* Description text based on tab */}
      <div className="mb-4 p-3 bg-gray-800 rounded-md">
        <p className="text-sm text-gray-300">
          {activeTab === 'to-read' && 
            "Books you plan to read to support your dream journey. Add titles that will educate, inspire or guide you."}
          {activeTab === 'reading' && 
            "Books you're currently reading. Track your progress and make notes on key learnings."}
          {activeTab === 'completed' && 
            "Books you've finished reading. Reflect on how they've contributed to your growth and dream manifestation."}
        </p>
      </div>
      
      {/* Book list */}
      <div className="space-y-2 mb-6">
        <h4 className="text-gray-300 text-sm font-medium border-b border-gray-700 pb-1 mb-2">
          {activeTab === 'to-read' && 'Books to Read'}
          {activeTab === 'reading' && 'Currently Reading'}
          {activeTab === 'completed' && 'Completed Books'}
        </h4>
        
        {filteredBooks.length === 0 ? (
          <div className="text-gray-500 text-sm py-4 text-center bg-gray-800/50 rounded-md">
            <p className="mb-2 font-medium">No books in this category</p>
            <p className="text-xs">
              {activeTab === 'to-read' && 'Add books you plan to read to support your dream.'}
              {activeTab === 'reading' && 'Move books here when you start reading them.'}
              {activeTab === 'completed' && 'Track books you\'ve finished to see your growth.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                className="flex items-start p-3 rounded bg-gray-800 shadow-sm"
              >
                <div className="w-12 h-16 flex-shrink-0 bg-gray-700 rounded overflow-hidden flex items-center justify-center mr-3">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <Book className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{book.title}</h4>
                      {book.author && (
                        <p className="text-gray-400 text-sm">by {book.author}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      {activeTab !== 'reading' && (
                        <button 
                          onClick={() => changeBookStatus(book.id, 'reading')}
                          className="text-blue-400 hover:text-blue-300"
                          title="Mark as reading"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                      )}
                      
                      {activeTab !== 'completed' && (
                        <button 
                          onClick={() => changeBookStatus(book.id, 'completed')}
                          className="text-green-400 hover:text-green-300"
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => startEditing(book.id)}
                        className="text-gray-400 hover:text-white"
                        title="Edit book"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Dates info */}
                  <div className="flex text-xs text-gray-500 mt-1 space-x-3">
                    {book.dateAdded && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Added: {formatDate(book.dateAdded)}</span>
                      </div>
                    )}
                    
                    {book.dateStarted && (
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span>Started: {formatDate(book.dateStarted)}</span>
                      </div>
                    )}
                    
                    {book.dateCompleted && (
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Completed: {formatDate(book.dateCompleted)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Notes */}
                  {book.notes && (
                    <p className="text-gray-400 text-sm mt-2 bg-gray-850 p-2 rounded">
                      {book.notes}
                    </p>
                  )}
                  
                  {/* Audio link */}
                  {book.audioLink && (
                    <div className="mt-2">
                      <a 
                        href={book.audioLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300 text-xs"
                      >
                        <Headphones className="h-3 w-3 mr-1" />
                        <span>Listen to Audiobook</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add new book form */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Add New Book</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter book title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Author</label>
            <input
              type="text"
              placeholder="Enter author name"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select
              value={newBook.status}
              onChange={(e) => setNewBook({ ...newBook, status: e.target.value as BookStatus })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="to-read">To Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
            <textarea
              placeholder="Add notes about this book"
              value={newBook.notes}
              onChange={(e) => setNewBook({ ...newBook, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Audiobook Link (optional)</label>
            <div className="flex">
              <input
                type="text"
                placeholder="Enter URL to audiobook"
                value={newBook.audioLink}
                onChange={(e) => setNewBook({ ...newBook, audioLink: e.target.value })}
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l text-white text-sm"
              />
              <button
                className="bg-gray-700 border border-gray-600 border-l-0 rounded-r px-3 text-gray-400 hover:text-white"
                title="Test link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* TODO: Add cover image upload when implementing image storage */}
          
          <button
            onClick={handleAddBook}
            disabled={!newBook.title.trim()}
            className={`w-full py-2 rounded flex items-center justify-center ${
              newBook.title.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Add Book to Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryComponent;