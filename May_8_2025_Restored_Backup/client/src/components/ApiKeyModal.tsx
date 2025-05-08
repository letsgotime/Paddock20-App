import React, { useState } from 'react';
import { X, Key, AlertTriangle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  serviceName: string;
  serviceDescription?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceName,
  serviceDescription
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(apiKey.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center mb-4">
          <Key className="w-6 h-6 mr-2 text-blue-400" />
          <h2 className="text-xl font-orbitron text-white">{serviceName} API Key</h2>
        </div>

        {serviceDescription && (
          <p className="mb-4 text-gray-300 text-sm">{serviceDescription}</p>
        )}

        <div className="mb-5 p-3 bg-red-950/30 border border-red-900/30 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-yellow-400 text-sm font-medium">Rate Limit Detected</p>
              <p className="text-gray-400 text-sm">
                The application has reached its API request limit. To continue receiving
                fresh weather data, please provide your personal API key.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="api-key" className="block mb-2 text-sm font-medium text-gray-300">
              Your API Key
            </label>
            <input
              type="text"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your API key"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-between items-center">
            <a
              href="https://home.openweathermap.org/api_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:underline"
            >
              Get a free API key
            </a>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-md ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;