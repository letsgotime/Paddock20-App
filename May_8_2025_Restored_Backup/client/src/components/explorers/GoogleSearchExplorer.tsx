import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { searchGoogle } from "@/services/search/googleSearchService";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  thumbnail?: string;
}

const GoogleSearchExplorer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term to continue",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const searchResults = await searchGoogle(query);
      
      if (searchResults && searchResults.items) {
        const formatted = searchResults.items.map((item: any) => ({
          title: item.title || 'No title',
          link: item.link || '#',
          snippet: item.snippet || 'No description available',
          thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || null
        }));
        setResults(formatted);
      } else {
        setResults([]);
        toast({
          title: "No results found",
          description: "Try a different search query",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Google search error:", error);
      toast({
        title: "Search failed",
        description: "Unable to complete your search. Please try again later.",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5 text-blue-400" />
            Google Search API Explorer
          </CardTitle>
          <CardDescription>
            Search the web with the Google Search API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Search Query</Label>
              <div className="flex space-x-2">
                <Input
                  id="search-query"
                  placeholder="Enter search terms..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Found {results.length} results for "{query}"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-blue-900/30 rounded-md p-4 hover:bg-blue-900/10 transition-colors">
                  <div className="flex gap-4">
                    {result.thumbnail && (
                      <div className="flex-shrink-0">
                        <img 
                          src={result.thumbnail} 
                          alt=""
                          className="w-20 h-20 object-cover rounded-md" 
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-1 min-w-0">
                      <h3 className="font-semibold text-blue-400 truncate">
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {result.title}
                        </a>
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{result.link}</p>
                      <p className="text-sm text-white/80 line-clamp-2">{result.snippet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-blue-900/30 pt-4">
            <div className="text-sm text-muted-foreground">
              Results powered by Google Search API
            </div>
            <Button variant="outline" onClick={() => setResults([])} size="sm">
              Clear Results
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default GoogleSearchExplorer;