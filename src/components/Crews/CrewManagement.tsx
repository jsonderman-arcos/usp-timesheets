import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Crew, TimeEntry } from '../../types';
import { Users, Plus, Edit2, Trash2, Search, Filter, UserCheck, UserX, MapPin, Clock, X, CheckCircle } from 'lucide-react';

const CrewManagement: React.FC = () => {
  const { crews, selectedContract, getCrewsByContract, deleteCrew, timeEntries, getTimeEntriesByCrew } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [expandedEquipment, setExpandedEquipment] = useState<Set<string>>(new Set());
  const [selectedCrewForTimesheet, setSelectedCrewForTimesheet] = useState<Crew | null>(null);
  const [editingCrew, setEditingCrew] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    crewName: string;
    active: boolean;
    members: any[];
    equipmentAssigned: string[];
  }>({
    crewName: '',
    active: true,
    members: [],
    equipmentAssigned: []
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  // Filter crews based on selected contract
  const contractCrews = selectedContract ? getCrewsByContract(selectedContract.id) : crews;

  // Apply filters
  const filteredCrews = contractCrews.filter(crew => {
    const matchesSearch = crew.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crew.supervisorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && crew.active) ||
                         (statusFilter === 'inactive' && !crew.active);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (crewId: string) => {
    if (window.confirm('Are you sure you want to delete this crew?')) {
      deleteCrew(crewId);
    }
  };

  const getSupervisorName = (supervisorId: string) => {
    // In a real app, this would look up the supervisor from users
    return crews.find(c => c.supervisorId === supervisorId)?.members[0]?.name || 'Unknown';
  };

  const toggleMembersExpanded = (crewId: string) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(crewId)) {
      newExpanded.delete(crewId);
    } else {
      newExpanded.add(crewId);
    }
    setExpandedMembers(newExpanded);
  };

  const toggleEquipmentExpanded = (crewId: string) => {
    const newExpanded = new Set(expandedEquipment);
    if (newExpanded.has(crewId)) {
      newExpanded.delete(crewId);
    } else {
      newExpanded.add(crewId);
    }
    setExpandedEquipment(newExpanded);
  };

  const handleViewTimesheets = (crew: Crew) => {
    setSelectedCrewForTimesheet(crew);
  };

  const closeTimesheetModal = () => {
    setSelectedCrewForTimesheet(null);
  };

  const handleEdit = (crew: Crew) => {
    setEditingCrew(crew.id);
    setEditForm({
      crewName: crew.crewName,
      active: crew.active,
      members: [...crew.members],
      equipmentAssigned: [...crew.equipmentAssigned]
    });
  };

  const handleCancelEdit = () => {
    setEditingCrew(null);
    setNewMemberName('');
    setNewMemberRole('');
    setNewEquipment('');
  };

  const handleSaveEdit = () => {
    if (editingCrew) {
      const crew = crews.find(c => c.id === editingCrew);
      if (crew) {
        const updatedCrew = {
          ...crew,
          crewName: editForm.crewName,
          active: editForm.active,
          members: editForm.members,
          equipmentAssigned: editForm.equipmentAssigned
        };
        // In a real app, this would call updateCrew
        console.log('Would update crew:', updatedCrew);
      }
    }
    handleCancelEdit();
  };

  const handleRemoveMember = (memberId: string) => {
    setEditForm(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const handleAddMember = () => {
    if (newMemberName.trim() && newMemberRole.trim()) {
      const newMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        role: newMemberRole.trim(),
        hourlyRate: 30,
        active: true
      };
      setEditForm(prev => ({
        ...prev,
        members: [...prev.members, newMember]
      }));
      setNewMemberName('');
      setNewMemberRole('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      equipmentAssigned: prev.equipmentAssigned.filter((_, i) => i !== index)
    }));
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      setEditForm(prev => ({
        ...prev,
        equipmentAssigned: [...prev.equipmentAssigned, newEquipment.trim()]
      }));
      setNewEquipment('');
    }
  };

  const getCrewTimeEntries = (crewId: string) => {
    return getTimeEntriesByCrew(crewId);
  };

  const getMemberName = (memberId: string, crew: Crew) => {
    const member = crew.members.find(m => m.id === memberId);
    return member?.name || 'Unknown Member';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crew Management</h1>
          <p className="text-gray-600">
            {selectedContract ? `${selectedContract.utilityName} - ${selectedContract.stormEvent}` : 'All Crews'}
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Crew</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search crews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Crews', 
            value: contractCrews.length, 
            icon: Users, 
            color: 'bg-blue-500' 
          },
          { 
            label: 'Active Crews', 
            value: contractCrews.filter(c => c.active).length, 
            icon: UserCheck, 
            color: 'bg-green-500' 
          },
          { 
            label: 'Total Members', 
            value: contractCrews.reduce((sum, crew) => sum + crew.members.length, 0), 
            icon: Users, 
            color: 'bg-purple-500' 
          },
          { 
            label: 'Inactive Crews', 
            value: contractCrews.filter(c => !c.active).length, 
            icon: UserX, 
            color: 'bg-orange-500' 
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Crews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrews.map((crew) => (
          <div key={crew.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${crew.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  {editingCrew === crew.id ? (
                    <input
                      type="text"
                      value={editForm.crewName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, crewName: e.target.value }))}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{crew.crewName}</h3>
                  )}
                  <p className="text-sm text-gray-600">{crew.members.length} members</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {editingCrew === crew.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Save changes"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(crew)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit crew"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Crew Status */}
            <div className="mb-4">
              {editingCrew === crew.id ? (
                <select
                  value={editForm.active ? 'active' : 'inactive'}
                  onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.value === 'active' }))}
                  className="text-xs font-semibold px-2 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  crew.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {crew.active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            {/* Crew Members */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Team Members</h4>
              <div className="space-y-2">
                {editingCrew === crew.id ? (
                  <>
                    {editForm.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-gray-900">{member.name}</span>
                          <span className="text-gray-500 ml-2">({member.role})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="text"
                        placeholder="Member name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleAddMember}
                        className="text-blue-600 hover:text-blue-700"
                        disabled={!newMemberName.trim() || !newMemberRole.trim()}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {(expandedMembers.has(crew.id) ? crew.members : crew.members.slice(0, 3)).map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{member.name}</span>
                        <span className="text-gray-500">{member.role}</span>
                      </div>
                    ))}
                    {crew.members.length > 3 && (
                      <button
                        onClick={() => toggleMembersExpanded(crew.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {expandedMembers.has(crew.id) 
                          ? 'Show less' 
                          : `+${crew.members.length - 3} more members`
                        }
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Equipment */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Equipment</h4>
              <div className="space-y-2">
                {editingCrew === crew.id ? (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {editForm.equipmentAssigned.map((equipment, index) => (
                        <div key={index} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          <span>{equipment}</span>
                          <button
                            onClick={() => handleRemoveEquipment(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="text"
                        placeholder="Equipment name"
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
                      />
                      <button
                        onClick={handleAddEquipment}
                        className="text-blue-600 hover:text-blue-700"
                        disabled={!newEquipment.trim()}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {(expandedEquipment.has(crew.id) ? crew.equipmentAssigned : crew.equipmentAssigned.slice(0, 2)).map((equipment, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {equipment}
                        </span>
                      ))}
                    </div>
                    {crew.equipmentAssigned.length > 2 && (
                      <button
                        onClick={() => toggleEquipmentExpanded(crew.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
                      >
                        {expandedEquipment.has(crew.id) 
                          ? 'Show less' 
                          : `+${crew.equipmentAssigned.length - 2} more equipment`
                        }
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              {editingCrew === crew.id ? (
                <div className="flex items-center space-x-2 w-full">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/gps-tracking" 
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View Location</span>
                  </Link>
                  <button 
                    onClick={() => handleViewTimesheets(crew)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    <span>View Timesheets</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCrews.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crews found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first crew'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
              <Plus className="w-4 h-4" />
              <span>Add First Crew</span>
            </button>
          )}
        </div>
      )}

      {/* Timesheet Modal */}
      {selectedCrewForTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCrewForTimesheet.crewName} - Timesheets
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCrewForTimesheet.members.length} members • Recent time entries
                </p>
              </div>
              <button
                onClick={closeTimesheetModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const crewTimeEntries = getCrewTimeEntries(selectedCrewForTimesheet.id);
                
                if (crewTimeEntries.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Time Entries</h4>
                      <p className="text-gray-500">This crew hasn't submitted any time entries yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {crewTimeEntries.map((entry) => (
                      <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                {getMemberName(entry.memberId, selectedCrewForTimesheet)}
                              </h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                                {entry.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{formatDate(entry.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {(entry.hoursRegular + entry.hoursOvertime).toFixed(1)}h total
                            </p>
                            {entry.hoursOvertime > 0 && (
                              <p className="text-xs text-orange-600">
                                {entry.hoursOvertime}h overtime
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Time:</span> {entry.startTime} - {entry.endTime}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Location:</span> {entry.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Work:</span> {entry.workDescription}
                            </p>
                            {entry.comments && (
                              <p className="text-gray-600">
                                <span className="font-medium">Notes:</span> {entry.comments}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;