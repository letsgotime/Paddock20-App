import { Link } from "wouter";
import { AlertCircle, Home, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  // Get the current URL path that caused the 404
  const currentPath = window.location.pathname;

  return (
    <div className="min-h-[calc(100vh-130px)] w-full flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md mx-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-blue-900/40 p-6 relative overflow-hidden">
        {/* F1-style decorative element */}
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
        
        <div className="flex mb-6 items-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
            <p className="text-gray-400 text-sm mt-1">The page you requested doesn't exist</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-md p-3 mb-6 border border-gray-700">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Requested URL:</span>
          </div>
          <code className="block bg-gray-900 p-2 rounded text-sm text-blue-400 font-mono overflow-x-auto">
            {currentPath}
          </code>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
            <Link href="/">
              <a className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Homepage
              </a>
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
            <Link href="/dashboard">
              <a className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </a>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
