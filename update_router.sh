#!/bin/bash

# Update components that use react-router-dom to use wouter instead
find client/src -type f -name "*.tsx" -o -name "*.jsx" | xargs grep -l "from 'react-router-dom'" | while read file; do
  echo "Processing $file..."
  
  # Replace import statements
  sed -i 's/import {.*} from '\''react-router-dom'\'';/import { useLocation, Link } from '\''wouter'\'';/' "$file"
  
  # Replace useNavigate
  sed -i 's/const navigate = useNavigate();/const [location, setLocation] = useLocation();/' "$file"
  
  # Replace navigate function calls
  sed -i 's/navigate(-1)/window.history.back()/' "$file"
  sed -i 's/navigate(\([^)]*\))/setLocation(\1)/' "$file"
done

echo "Update completed!"
