import React, { useState } from 'react';
import supabase from '../services/supabaseClient';
import { X, Save, Calendar, Wrench, Clock, FileText, Link, AlertTriangle } from 'lucide-react';

/**
 * Add Maintenance Form Component
 * A user-friendly form for adding maintenance records to vehicles
 */
const AddMaintenanceForm = ({ onClose, vehicleId, onMaintenanceAdded }) => {
  const [formData, setFormData] = useState({
    service_type: '',
    description: '',
    date_performed: new Date().toISOString().split('T')[0],
    mileage: '',
    provider: '',
    technician: '',
    cost: '',
    parts_replaced: '',
    labor_hours: '',
    warranty_info: '',
    invoice_number: '',
    priority: 'Normal',
    status: 'Completed',
    notes: '',
    reminder_date: '',
    document_url: '',
    document_label: '',
    recurring: false,
    recurring_interval: '',
    recurring_unit: 'months',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Common service types
  const serviceTypes = [
    'Oil Change', 'Tire Rotation', 'Brake Service', 'Inspection', 
    'Fluid Change', 'Engine Service', 'Electrical', 'Cooling System', 
    'Transmission Service', 'Air Filter', 'Fuel System', 'Battery Service',
    'Detailing', 'Paint Correction', 'Ceramic Coating', 'PPF Installation'
  ];
  
  // Status options
  const statusOptions = [
    'Completed', 'Scheduled', 'Pending', 'In Progress', 'Postponed', 'Cancelled'
  ];
  
  // Priority levels
  const priorityLevels = [
    'Low', 'Normal', 'High', 'Critical'
  ];
  
  // Service providers (common shops and dealers)
  const commonProviders = [
    'Dealer Service', 'Independent Shop', 'Specialty Shop', 'DIY', 
    'Mobile Mechanic', 'Tire Shop', 'Detailing Shop'
  ];
  
  // Recurring interval units
  const recurringUnits = [
    'days', 'weeks', 'months', 'years', 'miles'
  ];
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.service_type.trim()) newErrors.service_type = 'Service type is required';
    if (!formData.date_performed) newErrors.date_performed = 'Service date is required';
    if (formData.mileage && isNaN(Number(formData.mileage))) newErrors.mileage = 'Mileage must be a number';
    if (formData.cost && isNaN(Number(formData.cost))) newErrors.cost = 'Cost must be a number';
    if (formData.labor_hours && isNaN(Number(formData.labor_hours))) newErrors.labor_hours = 'Labor hours must be a number';
    
    // Validate URL if provided
    if (formData.document_url && !formData.document_url.match(/^(http|https):\/\/[^ "]+$/)) {
      newErrors.document_url = 'Please enter a valid URL starting with http:// or https://';
    }
    
    // If recurring is checked, validate interval
    if (formData.recurring && (!formData.recurring_interval || isNaN(Number(formData.recurring_interval)))) {
      newErrors.recurring_interval = 'Recurring interval must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit the form to add a new maintenance record
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Format numeric fields
      const maintenanceData = {
        ...formData,
        vehicle_id: vehicleId,
        mileage: formData.mileage ? Number(formData.mileage) : null,
        cost: formData.cost ? Number(formData.cost) : null,
        labor_hours: formData.labor_hours ? Number(formData.labor_hours) : null,
        recurring_interval: formData.recurring_interval ? Number(formData.recurring_interval) : null,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('Maintenance')
        .insert([maintenanceData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        if (onMaintenanceAdded) onMaintenanceAdded(data[0]);
        onClose();
      }
    } catch (error) {
      console.error('Error adding maintenance record:', error.message);
      setErrors({ form: 'Failed to add maintenance record. ' + error.message });
    }
    
    setLoading(false);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-blue-500/20 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-blue-400 font-orbitron text-2xl">Add Maintenance Record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {errors.form && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md mb-4">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Service Details */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Service Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Service Type*</label>
                <input
                  type="text"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  list="service-types"
                  className={`w-full bg-gray-800 border ${errors.service_type ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. Oil Change"
                />
                <datalist id="service-types">
                  {serviceTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
                {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}
              </div>
              
              {/* Service Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Service Date*</label>
                <input
                  type="date"
                  name="date_performed"
                  value={formData.date_performed}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.date_performed ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                />
                {errors.date_performed && <p className="text-red-500 text-xs mt-1">{errors.date_performed}</p>}
              </div>
              
              {/* Mileage */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mileage at Service</label>
                <input
                  type="text"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.mileage ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. 15000"
                />
                {errors.mileage && <p className="text-red-500 text-xs mt-1">{errors.mileage}</p>}
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              {/* Priority */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  {priorityLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              {/* Cost */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cost ($)</label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.cost ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. 175.50"
                />
                {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
              </div>
            </div>
          </div>
          
          {/* Service Provider Details */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Service Provider</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Service Provider</label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  list="service-providers"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Main Street Auto Shop"
                />
                <datalist id="service-providers">
                  {commonProviders.map((provider) => (
                    <option key={provider} value={provider} />
                  ))}
                </datalist>
              </div>
              
              {/* Technician */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Technician Name</label>
                <input
                  type="text"
                  name="technician"
                  value={formData.technician}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. John Smith"
                />
              </div>
              
              {/* Labor Hours */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Labor Hours</label>
                <input
                  type="text"
                  name="labor_hours"
                  value={formData.labor_hours}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.labor_hours ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. 2.5"
                />
                {errors.labor_hours && <p className="text-red-500 text-xs mt-1">{errors.labor_hours}</p>}
              </div>
              
              {/* Invoice Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. INV-12345"
                />
              </div>
            </div>
          </div>
          
          {/* Parts and Warranty */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Parts & Warranty</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Parts Replaced */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Parts Replaced</label>
                <input
                  type="text"
                  name="parts_replaced"
                  value={formData.parts_replaced}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Oil filter, air filter, oil (5W-30 synthetic)"
                />
              </div>
              
              {/* Warranty Info */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Warranty Information</label>
                <input
                  type="text"
                  name="warranty_info"
                  value={formData.warranty_info}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Parts warranty: 12 months / Labor warranty: 90 days"
                />
              </div>
            </div>
          </div>
          
          {/* Recurring & Reminders */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Recurring & Reminders</h3>
            
            <div className="space-y-4">
              {/* Recurring Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="recurring" className="text-white">
                  This maintenance is recurring
                </label>
              </div>
              
              {/* Recurring Details - Show only if recurring is checked */}
              {formData.recurring && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Repeat Every</label>
                    <input
                      type="text"
                      name="recurring_interval"
                      value={formData.recurring_interval}
                      onChange={handleChange}
                      className={`w-full bg-gray-800 border ${errors.recurring_interval ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                      placeholder="e.g. 6"
                    />
                    {errors.recurring_interval && <p className="text-red-500 text-xs mt-1">{errors.recurring_interval}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Interval Unit</label>
                    <select
                      name="recurring_unit"
                      value={formData.recurring_unit}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      {recurringUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Reminder Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reminder Date (Next Service)</label>
                <input
                  type="date"
                  name="reminder_date"
                  value={formData.reminder_date}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Documentation */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Documentation</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Document URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Document URL (Invoice/Receipt)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-700 border border-r-0 border-gray-700 rounded-l-md">
                    <Link size={16} className="text-gray-400" />
                  </span>
                  <input
                    type="url"
                    name="document_url"
                    value={formData.document_url}
                    onChange={handleChange}
                    className={`flex-1 bg-gray-800 border ${errors.document_url ? 'border-red-500' : 'border-gray-700'} rounded-r-md px-3 py-2 text-white`}
                    placeholder="https://drive.google.com/invoice-doc"
                  />
                </div>
                {errors.document_url && <p className="text-red-500 text-xs mt-1">{errors.document_url}</p>}
              </div>
              
              {/* Document Label */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Document Label</label>
                <input
                  type="text"
                  name="document_label"
                  value={formData.document_label}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Invoice #12345"
                />
              </div>
            </div>
          </div>
          
          {/* Description and Notes */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Description & Notes</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Detailed description of the maintenance performed..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Any additional notes, recommendations, or follow-up details..."
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Add Maintenance Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaintenanceForm;