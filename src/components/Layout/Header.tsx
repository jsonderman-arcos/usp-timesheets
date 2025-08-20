import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedContract, utilityContracts, setSelectedContract } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showContractSelector, setShowContractSelector] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleContractChange = (contract: any) => {
    setSelectedContract(contract);
    setShowContractSelector(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">USP</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Portal</h1>
          </div>
          
          {/* Contract Selector */}
          <div className="relative">
            <button
              onClick={() => setShowContractSelector(!showContractSelector)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {selectedContract?.utilityName || 'Select Contract'}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedContract?.stormEvent}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showContractSelector && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2">Select Utility Contract</div>
                  {utilityContracts.map((contract) => (
                    <button
                      key={contract.id}
                      onClick={() => handleContractChange(contract)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                        selectedContract?.id === contract.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      <div className="font-medium">{contract.utilityName}</div>
                      <div className="text-sm text-gray-500">{contract.stormEvent} • {contract.region}</div>
                      <div className="text-xs text-gray-400">{contract.contractNumber}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;