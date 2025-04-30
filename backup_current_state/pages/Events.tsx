import React, { useState, useEffect } from 'react';
import { events, eventTypes, eventCities, eventTypeColors, type Event } from '../data/eventData';

type FilterType = 'all' | 'eventType' | 'city' | 'quarter' | 'month';

function Events() {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [editEventId, setEditEventId] = useState<number | null>(null);

  // Generate quarters from events
  const quarters = [
    { id: 'Q1-2025', name: 'Q1 2025 (Jan-Mar)' },
    { id: 'Q2-2025', name: 'Q2 2025 (Apr-Jun)' },
    { id: 'Q3-2025', name: 'Q3 2025 (Jul-Sep)' },
    { id: 'Q4-2025', name: 'Q4 2025 (Oct-Dec)' },
    { id: 'Q1-2026', name: 'Q1 2026 (Jan-Mar)' },
    { id: 'Q2-2026', name: 'Q2 2026 (Apr-Jun)' }
  ];

  // Generate months from events
  const months = [
    { id: '2025-01', name: 'January 2025' },
    { id: '2025-02', name: 'February 2025' },
    { id: '2025-03', name: 'March 2025' },
    { id: '2025-04', name: 'April 2025' },
    { id: '2025-05', name: 'May 2025' },
    { id: '2025-06', name: 'June 2025' },
    { id: '2025-07', name: 'July 2025' },
    { id: '2025-08', name: 'August 2025' },
    { id: '2025-09', name: 'September 2025' },
    { id: '2025-10', name: 'October 2025' },
    { id: '2025-11', name: 'November 2025' },
    { id: '2025-12', name: 'December 2025' },
    { id: '2026-01', name: 'January 2026' },
    { id: '2026-02', name: 'February 2026' },
    { id: '2026-03', name: 'March 2026' },
    { id: '2026-04', name: 'April 2026' }
  ];

  const getDateFromString = (dateStr: string) => {
    const [month, day, year] = dateStr.split(', ')[0].split(' ');
    const monthMap: {[key: string]: number} = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return new Date(parseInt(year), monthMap[month], parseInt(day));
  };

  const getQuarterFromDate = (dateStr: string) => {
    const date = getDateFromString(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    let quarter;
    
    if (month <= 2) quarter = 'Q1';
    else if (month <= 5) quarter = 'Q2';
    else if (month <= 8) quarter = 'Q3';
    else quarter = 'Q4';
    
    return `${quarter}-${year}`;
  };

  const getMonthFromDate = (dateStr: string) => {
    const date = getDateFromString(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let result = [...events];
    
    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.city.toLowerCase().includes(search) ||
        event.eventType.toLowerCase().includes(search) ||
        event.theme.toLowerCase().includes(search) ||
        event.venue.toLowerCase().includes(search) ||
        event.charity.toLowerCase().includes(search)
      );
    }
    
    // Apply specific filters
    if (activeFilter === 'eventType' && eventTypeFilter) {
      result = result.filter(event => event.eventType.includes(eventTypeFilter));
    } else if (activeFilter === 'city' && cityFilter) {
      result = result.filter(event => event.city === cityFilter);
    } else if (activeFilter === 'quarter' && timeFilter) {
      result = result.filter(event => getQuarterFromDate(event.date) === timeFilter);
    } else if (activeFilter === 'month' && timeFilter) {
      result = result.filter(event => getMonthFromDate(event.date) === timeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = getDateFromString(a.date);
        const dateB = getDateFromString(b.date);
        return sortDir === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'cost') {
        const costA = parseFloat(a.estimatedCost.replace('$', '').replace(',', ''));
        const costB = parseFloat(b.estimatedCost.replace('$', '').replace(',', ''));
        return sortDir === 'asc' ? costA - costB : costB - costA;
      } else if (sortBy === 'week') {
        return sortDir === 'asc' ? a.week - b.week : b.week - a.week;
      } else {
        // Sort by city, eventType, etc.
        const valueA = (a as any)[sortBy] || '';
        const valueB = (b as any)[sortBy] || '';
        return sortDir === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
    });
    
    setFilteredEvents(result);
  }, [activeFilter, eventTypeFilter, cityFilter, timeFilter, searchTerm, sortBy, sortDir]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const getEventTypeClass = (eventType: string) => {
    for (const type of Object.keys(eventTypeColors)) {
      if (eventType.includes(type)) {
        return (eventTypeColors as any)[type];
      }
    }
    return 'bg-gray-600';
  };

  const handleFilterChange = (filterType: FilterType, value?: string) => {
    setActiveFilter(filterType);
    
    if (filterType === 'eventType') {
      setEventTypeFilter(value || '');
      setCityFilter('');
      setTimeFilter('');
    } else if (filterType === 'city') {
      setCityFilter(value || '');
      setEventTypeFilter('');
      setTimeFilter('');
    } else if (filterType === 'quarter' || filterType === 'month') {
      setTimeFilter(value || '');
      setEventTypeFilter('');
      setCityFilter('');
    } else {
      // Reset all filters for 'all'
      setEventTypeFilter('');
      setCityFilter('');
      setTimeFilter('');
    }
  };

  const resetFilters = () => {
    setActiveFilter('all');
    setEventTypeFilter('');
    setCityFilter('');
    setTimeFilter('');
    setSearchTerm('');
  };

  return (
    <div className="bg-black min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-orbitron text-blue-400 mb-6">🏁 Motorsports Events Calendar</h1>
        <p className="text-white mb-8">
          Your 60-week lineup of premium motorsports and timepiece events across North America.
        </p>

        {/* Search and filter controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                Calendar View
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              All Events
            </button>
            <div className="relative group">
              <button
                onClick={() => handleFilterChange(activeFilter === 'eventType' ? 'all' : 'eventType')}
                className={`px-4 py-2 rounded-md ${activeFilter === 'eventType' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                Event Type {eventTypeFilter && `(${eventTypeFilter})`}
              </button>
              {activeFilter === 'eventType' && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('eventType', type)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${eventTypeFilter === type ? 'bg-gray-800' : ''}`}
                    >
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getEventTypeClass(type)}`}></span>
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative group">
              <button
                onClick={() => handleFilterChange(activeFilter === 'city' ? 'all' : 'city')}
                className={`px-4 py-2 rounded-md ${activeFilter === 'city' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                City {cityFilter && `(${cityFilter})`}
              </button>
              {activeFilter === 'city' && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {eventCities.map(city => (
                    <button
                      key={city}
                      onClick={() => handleFilterChange('city', city)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${cityFilter === city ? 'bg-gray-800' : ''}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative group">
              <button
                onClick={() => handleFilterChange(activeFilter === 'quarter' ? 'all' : 'quarter')}
                className={`px-4 py-2 rounded-md ${activeFilter === 'quarter' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                Quarter {timeFilter && activeFilter === 'quarter' && `(${timeFilter})`}
              </button>
              {activeFilter === 'quarter' && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                  {quarters.map(quarter => (
                    <button
                      key={quarter.id}
                      onClick={() => handleFilterChange('quarter', quarter.id)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${timeFilter === quarter.id ? 'bg-gray-800' : ''}`}
                    >
                      {quarter.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative group">
              <button
                onClick={() => handleFilterChange(activeFilter === 'month' ? 'all' : 'month')}
                className={`px-4 py-2 rounded-md ${activeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                Month {timeFilter && activeFilter === 'month' && `(${months.find(m => m.id === timeFilter)?.name})`}
              </button>
              {activeFilter === 'month' && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {months.map(month => (
                    <button
                      key={month.id}
                      onClick={() => handleFilterChange('month', month.id)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${timeFilter === month.id ? 'bg-gray-800' : ''}`}
                    >
                      {month.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {(eventTypeFilter || cityFilter || timeFilter || searchTerm) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-md bg-red-500 text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <span className="text-white">Sort by:</span>
          <button
            onClick={() => handleSort('week')}
            className={`px-3 py-1 rounded-md ${sortBy === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            Week {getSortIcon('week')}
          </button>
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1 rounded-md ${sortBy === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            Date {getSortIcon('date')}
          </button>
          <button
            onClick={() => handleSort('city')}
            className={`px-3 py-1 rounded-md ${sortBy === 'city' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            City {getSortIcon('city')}
          </button>
          <button
            onClick={() => handleSort('eventType')}
            className={`px-3 py-1 rounded-md ${sortBy === 'eventType' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            Event Type {getSortIcon('eventType')}
          </button>
          <button
            onClick={() => handleSort('cost')}
            className={`px-3 py-1 rounded-md ${sortBy === 'cost' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            Cost {getSortIcon('cost')}
          </button>
        </div>

        {/* Event Count */}
        <div className="mb-6 text-white">
          <p>Showing {filteredEvents.length} of {events.length} events</p>
        </div>

        {/* Events Table/List View */}
        {viewMode === 'list' && (
          <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Week
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      City
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Venue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Theme
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Charity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Est. Cost
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.week}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeClass(event.eventType)}`}>
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.venue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.theme}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.charity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {event.estimatedCost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <button
                          onClick={() => setEditEventId(event.id === editEventId ? null : event.id)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          Edit
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Calendar View */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                <div className={`px-4 py-3 ${getEventTypeClass(event.eventType)}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold">Week {event.week}</h3>
                    <span className="bg-black bg-opacity-30 px-2 py-1 rounded-full text-xs text-white">
                      {event.date}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-xl mt-1">{event.eventType}</h2>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-start mb-2">
                      <span className="text-gray-400 w-24">City:</span>
                      <span className="text-white flex-1">{event.city}</span>
                    </div>
                    <div className="flex items-start mb-2">
                      <span className="text-gray-400 w-24">Venue:</span>
                      <span className="text-white flex-1">{event.venue}</span>
                    </div>
                    <div className="flex items-start mb-2">
                      <span className="text-gray-400 w-24">Theme:</span>
                      <span className="text-white flex-1">{event.theme}</span>
                    </div>
                    <div className="flex items-start mb-2">
                      <span className="text-gray-400 w-24">Charity:</span>
                      <span className="text-white flex-1">{event.charity}</span>
                    </div>
                    <div className="flex items-start mb-2">
                      <span className="text-gray-400 w-24">Est. Cost:</span>
                      <span className="text-white flex-1">{event.estimatedCost}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <h4 className="text-gray-400 mb-2 text-sm">Sponsors</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-800 rounded px-2 py-1">
                        <span className="text-xs text-gray-400">P1</span>
                        <p className="text-sm text-white truncate">{event.sponsors.p1}</p>
                      </div>
                      <div className="bg-gray-800 rounded px-2 py-1">
                        <span className="text-xs text-gray-400">P2</span>
                        <p className="text-sm text-white truncate">{event.sponsors.p2}</p>
                      </div>
                      <div className="bg-gray-800 rounded px-2 py-1">
                        <span className="text-xs text-gray-400">P3</span>
                        <p className="text-sm text-white truncate">{event.sponsors.p3}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => setEditEventId(event.id === editEventId ? null : event.id)}
                    >
                      Edit
                    </button>
                    <button className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Event Modal */}
        {editEventId && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setEditEventId(null)}></div>
            <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl z-10 p-6 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-orbitron text-blue-400 mb-4">Edit Event</h2>
              <p className="text-gray-400 mb-6">Make changes to event information below</p>
              
              {/* Edit form would go here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-400 mb-2">Week Number</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.week}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Date</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.date}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">City</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.city}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Event Type</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.eventType}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Venue</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.venue}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Theme</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.theme}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Charity</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.charity}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Estimated Cost</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.estimatedCost}
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-orbitron text-blue-400 mb-2">Sponsors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-400 mb-2">P1 Sponsor</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.sponsors.p1}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">P2 Sponsor</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.sponsors.p2}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">P3 Sponsor</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.sponsors.p3}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">P4 Sponsor</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.sponsors.p4}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">P5 Sponsor</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={events.find(e => e.id === editEventId)?.sponsors.p5}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                  onClick={() => setEditEventId(null)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  onClick={() => {
                    alert('Save functionality would be implemented here');
                    setEditEventId(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;