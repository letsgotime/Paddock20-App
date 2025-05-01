import React from 'react';
import { useUnits } from '../contexts/UnitsContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const UnitToggle = () => {
  const { unitSystem, setUnitSystem, UNIT_SYSTEMS } = useUnits();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 bg-gray-800 hover:bg-gray-700 border border-gray-700"
        >
          <Settings className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
          <span className="text-xs font-medium">
            {unitSystem === UNIT_SYSTEMS.IMPERIAL ? '°F' : '°C'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 bg-gray-800 text-white border-gray-700">
        <DropdownMenuItem 
          className={`flex items-center cursor-pointer hover:bg-gray-700 ${unitSystem === UNIT_SYSTEMS.IMPERIAL ? 'text-blue-400' : ''}`}
          onClick={() => setUnitSystem(UNIT_SYSTEMS.IMPERIAL)}
        >
          <span className="mr-2">🇺🇸</span>
          <span className="flex-1">Imperial (°F)</span>
          {unitSystem === UNIT_SYSTEMS.IMPERIAL && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`flex items-center cursor-pointer hover:bg-gray-700 ${unitSystem === UNIT_SYSTEMS.METRIC ? 'text-blue-400' : ''}`}
          onClick={() => setUnitSystem(UNIT_SYSTEMS.METRIC)}
        >
          <span className="mr-2">🌎</span>
          <span className="flex-1">Metric (°C)</span>
          {unitSystem === UNIT_SYSTEMS.METRIC && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UnitToggle;