import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { schoolsApi, usersApi, auditApi } from '@/services/api';
import type { User } from '@/types';
import NotificationAlert from '@/components/NotificationAlert';
import { useActivityDialog } from '@/hooks/useActivityDialog';
import ActivityDialog from '@/components/ActivityDialog';

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user: User = JSON.parse(localStorage.getItem('user') || '{}');
  const { dialog, showSuccess, showError, showConfirm, closeDialog } = useActivityDialog();
  const [activeTab, setActiveTab] = useState<'schools' | 'users'>('schools');
  const [showEditSchool, setShowEditSchool] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [schoolType, setSchoolType] = useState<string>('Nursery');
  const [schoolLogo, setSchoolLogo] = useState<File | null>(null);

  const levelsByType: Record<string, string[]> = {
    Nursery: ['Baby', 'Middle', 'Top'],
    Primary: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
    Secondary: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  };

  const { data: schools, isLoading: loadingSchools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolsApi.list(),
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: activeTab === 'users',
    select: (data) => data?.filter((u: any) => u.role !== 'system_admin' || u.email === user.email),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => schoolsApi.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => auditApi.getRecentActivity(10),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Auto-refresh data when mutations complete
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);



  const createSchoolMutation = useMutation({
    mutationFn: (data: any) => schoolsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      setShowAddSchool(false);
      showSuccess('School Created!', 'The school has been created successfully');
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => schoolsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      setShowEditSchool(false);
      setEditingSchool(null);
      showSuccess('School Updated!', 'The school has been updated successfully');
    },
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: (id: string) => schoolsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      showSuccess('School Deleted!', 'The school has been deleted successfully');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      setShowAddUser(false);
      showSuccess('User Created!', 'The user has been created successfully');
    },
    onError: (error: any) => {
      console.error('User creation error:', error.response?.data || error.message);
      showError('User Creation Failed', error.response?.data?.error || error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      setEditingUser(null);
      showSuccess('User Updated!', 'The user has been updated successfully');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      showSuccess('User Deleted!', 'The user has been deleted successfully');
    },
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSchoolSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const levels = Array.from(formData.getAll('levels')) as string[];
    
    let logoUrl = editingSchool?.logo_url || '';
    if (schoolLogo) {
      const uploadFormData = new FormData();
      uploadFormData.append('logo', schoolLogo);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8080/api/v1/upload/logo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData,
      });
      const result = await response.json();
      logoUrl = 'http://localhost:8080' + result.url;
    }
    
    const data: any = {
      name: formData.get('name'),
      type: formData.get('type'),
      address: formData.get('address'),
      country: formData.get('country') || 'Uganda',
      region: formData.get('region') || '',
      contact_email: formData.get('contact_email'),
      phone: formData.get('phone'),
      logo_url: logoUrl,
      motto: formData.get('motto'),
      config: { levels },
      levels: levels, // Send levels separately for backend processing
    };
    
    if (editingSchool) {
      await updateSchoolMutation.mutateAsync({ id: editingSchool.id, data });
    } else {
      await createSchoolMutation.mutateAsync(data);
    }
    queryClient.invalidateQueries({ queryKey: ['classes'] });
  };

  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const schoolId = formData.get('school_id') as string;
    const data: any = {
      email: formData.get('email'),
      full_name: formData.get('full_name'),
      role: formData.get('role'),
    };
    if (schoolId && schoolId !== '') {
      data.school_id = schoolId;
    }
    if (!editingUser) {
      data.password = formData.get('password');
    }
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleDeleteUser = (id: string) => {
    showConfirm(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      () => deleteUserMutation.mutate(id),
      'Delete',
      'Cancel'
    );
  };

  const handleDeleteSchool = (id: string) => {
    showConfirm(
      'Delete School',
      'Are you sure you want to delete this school? This will also delete all associated data and cannot be undone.',
      () => deleteSchoolMutation.mutate(id),
      'Delete',
      'Cancel'
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">System Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Manage schools and users</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationAlert />
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">{user.full_name}</p>
                <p className="text-xs text-blue-600">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition shadow-md hover:shadow-lg">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Schools</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_schools}</p>
              <div className="mt-3 space-y-1">
                {Object.entries(stats.schools_by_type).map(([type, count]) => (
                  <p key={type} className="text-sm text-gray-600">{type}: {count}</p>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-green-600">{stats.total_users}</p>
              <div className="mt-3 space-y-1">
                {Object.entries(stats.users_by_role).map(([role, count]) => (
                  <p key={role} className="text-sm text-gray-600">{role.replace('_', ' ')}: {count}</p>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.total_students}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Schools</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.total_schools || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Total schools</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button onClick={() => setActiveTab('schools')} className={`px-6 py-3 font-semibold transition ${activeTab === 'schools' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            School Management
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-semibold transition ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            User Management
          </button>
        </div>

        {activeTab === 'schools' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Schools</h2>
                <p className="text-gray-600 mt-1">Manage all schools in the system</p>
              </div>
              <button onClick={() => setShowAddSchool(true)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg flex items-center gap-2">
                <span className="text-xl">+</span> Add School
              </button>
            </div>
            {loadingSchools ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools?.map((school: any) => (
                  <div key={school.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2"></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{school.name}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{school.type}</span>
                        </div>
                        {school.logo_url && (
                          <img src={school.logo_url} alt="Logo" className="h-12 w-12 object-contain border rounded ml-4" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><span className="font-semibold">📍</span> {school.address || 'No address'}</p>
                        <p><span className="font-semibold">✉️</span> {school.contact_email || 'No email'}</p>
                        <p><span className="font-semibold">📞</span> {school.phone || 'No phone'}</p>
                        {school.motto && <p className="italic">"<span className="font-semibold">🎯</span> {school.motto}"</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingSchool(school); setSchoolType(school.type); setShowEditSchool(true); }} className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteSchool(school.id)} className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <p className="text-gray-600 mt-1">Manage system users</p>
              </div>
              <button onClick={() => setShowAddUser(true)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg flex items-center gap-2">
                <span className="text-xl">+</span> Add User
              </button>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">School</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{u.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'system_admin' ? 'bg-red-100 text-red-800' :
                              u.role === 'school_admin' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {u.school?.name || 'No school assigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button onClick={() => setEditingUser(u)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Stats and Recent Activity */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {stats && (
                <>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      👥 Users by School
                    </h3>
                    <div className="space-y-2">
                      {stats.users_by_school?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700 text-sm">{item.school_name}</span>
                          <span className="font-semibold text-blue-600">{item.user_count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🎓 Students by School
                    </h3>
                    <div className="space-y-2">
                      {stats.students_by_school?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700 text-sm">{item.school_name}</span>
                          <span className="font-semibold text-purple-600">{item.student_count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  ⚡ Recent Activity
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentActivity?.length > 0 ? (
                    recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.action === 'CREATE' ? 'bg-green-500' :
                          activity.action === 'UPDATE' ? 'bg-blue-500' :
                          activity.action === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.action} {activity.resource_type}
                          </p>
                          {(activity.after?.name || activity.before?.name) && (
                            <p className="text-xs text-gray-700 font-medium mt-1 truncate">
                              📝 {activity.after?.name || activity.before?.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            👤 {activity.user_name || 'Unknown User'}
                            {activity.school_name && ` (${activity.school_name})`}
                          </p>
                          {activity.ip && (
                            <p className="text-xs text-gray-500">
                              📍 IP: {activity.ip}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            🕒 {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {(showAddSchool || showEditSchool) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">{editingSchool ? 'Edit School' : 'Add New School'}</h3>
            </div>
            <form id="schoolForm" onSubmit={handleSchoolSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Name *</label>
                <input name="name" defaultValue={editingSchool?.name} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="Enter school name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Type *</label>
                <select name="type" defaultValue={editingSchool?.type || 'Primary'} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" onChange={(e) => setSchoolType(e.target.value)}>
                  <option value="Nursery">Nursery</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Levels * (select one or more)</label>
                <div className="space-y-2 border-2 border-gray-300 rounded-lg px-4 py-3 max-h-40 overflow-y-auto bg-gray-50">
                  {levelsByType[schoolType]?.map(level => (
                    <label key={level} className="flex items-center hover:bg-white px-2 py-1 rounded cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        name="levels" 
                        value={level} 
                        defaultChecked={editingSchool?.config?.levels?.includes(level)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                      />
                      <span className="ml-3 text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Classes and subjects will be automatically created for selected levels</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea name="address" defaultValue={editingSchool?.address} rows={3} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none" placeholder="Enter school address" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input name="contact_email" defaultValue={editingSchool?.contact_email} type="email" className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="school@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input name="phone" defaultValue={editingSchool?.phone} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="+256 XXX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Motto</label>
                <input name="motto" defaultValue={editingSchool?.motto} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="Enter school motto" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setSchoolLogo(e.target.files?.[0] || null)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                {editingSchool?.logo_url && <img src={editingSchool.logo_url} alt="Current logo" className="mt-2 h-16 w-16 object-contain border rounded" />}
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button type="submit" form="schoolForm" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg">
                {editingSchool ? 'Update School' : 'Create School'}
              </button>
              <button type="button" onClick={() => { setShowEditSchool(false); setShowAddSchool(false); setEditingSchool(null); }} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddUser || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            </div>
            <form id="userForm" onSubmit={handleUserSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input name="full_name" defaultValue={editingUser?.full_name} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="user@example.com" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input name="password" type="password" required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="Min 8 characters" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                <select name="role" defaultValue={editingUser?.role} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                  <option value="">Select role</option>
                  <option value="school_admin">School Admin</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School *</label>
                <select name="school_id" defaultValue={editingUser?.school_id} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                  <option value="">Select school</option>
                  {schools?.map((school: any) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button type="submit" form="userForm" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={() => { setShowAddUser(false); setEditingUser(null); }} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ActivityDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </div>
  );
}
