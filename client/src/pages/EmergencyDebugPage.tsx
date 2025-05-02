import React, { useState } from 'react';

// Extremely minimal page with no external dependencies for debugging
export default function EmergencyDebugPage() {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div style={{ 
      backgroundColor: '#000', 
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#3b82f6', textAlign: 'center', marginBottom: '20px' }}>
        EMERGENCY DEBUG PAGE
      </h1>
      
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#aaa' }}>
        This is a minimal page for debugging white screen issues
      </p>
      
      {/* Basic tab navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '20px',
        overflowX: 'auto',
        padding: '10px',
        backgroundColor: '#111',
        borderRadius: '8px'
      }}>
        {['tab1', 'tab2', 'tab3', 'tab4', 'tab5'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              margin: '0 5px',
              backgroundColor: activeTab === tab ? '#1e40af' : 'transparent',
              color: activeTab === tab ? '#fff' : '#aaa',
              border: activeTab === tab ? '1px solid #3b82f6' : '1px solid #333',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tab {tab.replace('tab', '')}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div style={{
        backgroundColor: '#111',
        borderRadius: '8px',
        padding: '20px',
        minHeight: '300px'
      }}>
        {activeTab === 'tab1' && (
          <div>
            <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Tab 1 Content</h2>
            <p>This is the content for Tab 1. We're using inline styles for everything to avoid any CSS conflicts.</p>
          </div>
        )}
        
        {activeTab === 'tab2' && (
          <div>
            <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Tab 2 Content</h2>
            <p>This is the content for Tab 2. No components, no dependencies, just pure React.</p>
          </div>
        )}
        
        {activeTab === 'tab3' && (
          <div>
            <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Tab 3 Content</h2>
            <p>This is the content for Tab 3. Testing simple tab switching without any fancy effects.</p>
          </div>
        )}
        
        {activeTab === 'tab4' && (
          <div>
            <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Tab 4 Content</h2>
            <p>This is the content for Tab 4. Completely isolated from the rest of the application.</p>
          </div>
        )}
        
        {activeTab === 'tab5' && (
          <div>
            <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Tab 5 Content</h2>
            <p>This is the content for Tab 5. If this works, we know the issue is with component dependencies.</p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p>Current active tab: {activeTab}</p>
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '10px' }}>
          This page uses no external components, no TailwindCSS, and no imported styles.
        </p>
      </div>
    </div>
  );
}