import React from 'react'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-4 border-b border-darkcase-mediumGray mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 pb-3 font-semibold transition-colors ${
            activeTab === tab.id
              ? 'text-white border-b-2 border-darkcase-crimson'
              : 'text-netflix-lightGray hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

