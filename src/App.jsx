import { useState } from 'react';
import './App.css';
import Analyze from './components/Analyze';
import UploadCsv from './components/UploadCsv';
import Glossary from './components/Glossary';

const TABS = [
  { id: 'analyze', label: 'Live Climate Data' },
  { id: 'upload', label: 'Upload / Sample' },
  { id: 'glossary', label: 'Glossary' },
];

function App() {
  const [activeTab, setActiveTab] = useState('analyze');

  return (
    <>
      <header className="app-header">
        <div className="logo" aria-hidden="true">🌎</div>
        <h1>Climate Risk Analysis</h1>
        <nav className="nav-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="container">
        {activeTab === 'analyze' && <Analyze />}
        {activeTab === 'upload' && <UploadCsv />}
        {activeTab === 'glossary' && <Glossary />}
      </div>
    </>
  );
}

export default App;
