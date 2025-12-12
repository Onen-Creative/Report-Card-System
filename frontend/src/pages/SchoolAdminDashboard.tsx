import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { studentsApi, classesApi, schoolsApi } from '@/services/api';
import * as XLSX from 'xlsx';
import type { User, Student } from '@/types';
import ReportCard from './ReportCard';
import BulkResultsEntry from './BulkResultsEntry';
import { useActivityDialog } from '@/hooks/useActivityDialog';
import ActivityDialog from '@/components/ActivityDialog';

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user: User = JSON.parse(localStorage.getItem('user') || '{}');
  const { dialog, showSuccess, showError, showConfirm, closeDialog } = useActivityDialog();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'students' | 'bulk' | 'reports'>('students');

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', selectedClass],
    queryFn: () => studentsApi.list(selectedClass !== 'all' ? { class_level: selectedClass } : undefined),
  });

  const { data: levels } = useQuery({
    queryKey: ['class-levels'],
    queryFn: () => classesApi.getLevels(),
  });

  const { data: userSchool } = useQuery({
    queryKey: ['school', user.school_id],
    queryFn: () => schoolsApi.get(user.school_id),
    enabled: !!user.school_id,
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      showSuccess('Student Deleted!', 'The student has been deleted successfully');
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: any) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowAddStudent(false);
      showSuccess('Student Created!', 'The student has been created successfully');
    },
    onError: (error: any) => {
      showError('Student Creation Failed', error.response?.data?.error || error.message);
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditingStudent(null);
      showSuccess('Student Updated!', 'The student has been updated successfully');
    },
    onError: (error: any) => {
      showError('Student Update Failed', error.response?.data?.error || error.message);
    },
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDeleteStudent = (id: string) => {
    showConfirm(
      'Delete Student',
      'Are you sure you want to delete this student? This action cannot be undone.',
      () => deleteStudentMutation.mutate(id),
      'Delete',
      'Cancel'
    );
  };

  const generateAdmissionNo = (classId: string, year: string) => {
    const selectedClassData = classes?.find((c: any) => c.id === classId);
    const classCode = selectedClassData?.level?.replace(/\s/g, '') || 'CLS';
    const studentCount = (students?.length || 0) + 1;
    return `SCH/${classCode}/${year}/${String(studentCount).padStart(3, '0')}`;
  };

  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const classLevel = formData.get('class_level') as string;
    const year = formData.get('year') as string;
    const term = formData.get('term') as string;
    
    const data: any = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      gender: formData.get('gender'),
    };

    if (!editingStudent) {
      data.class_level = classLevel;
      data.term = term;
      data.year = parseInt(year);
    }

    if (editingStudent) {
      updateStudentMutation.mutate({ id: editingStudent.id, data });
    } else {
      createStudentMutation.mutate(data);
    }
  };

  const exportToExcel = () => {
    try {
      const data = students?.map((s: any) => ({
        'Admission No': s.admission_no,
        'First Name': s.first_name,
        'Last Name': s.last_name,
        'Class': s.class_name || 'N/A',
        'Gender': s.gender,
      }));
      const ws = XLSX.utils.json_to_sheet(data || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccess('Export Successful!', 'Student data has been exported to Excel');
    } catch (error) {
      showError('Export Failed', 'Failed to export student data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 pb-16 sm:pb-0">
      <nav className="bg-white shadow-xl border-b border-gray-100 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto mobile-padding py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent truncate">
                School Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium truncate">{userSchool?.name || 'Loading...'}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 px-3 py-2 rounded-xl border border-green-100 flex-shrink-0">
                <p className="text-xs sm:text-sm font-semibold text-green-900 truncate max-w-32 sm:max-w-none">{user.full_name}</p>
                <p className="text-xs text-green-600 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-xs sm:text-sm touch-manipulation"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mobile-padding py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 hidden sm:block">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100 flex">
            <button 
              onClick={() => setActiveSection('students')} 
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap touch-manipulation ${
                activeSection === 'students' 
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              👥 Students
            </button>
            <button 
              onClick={() => setActiveSection('bulk')} 
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap touch-manipulation ${
                activeSection === 'bulk' 
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📝 Bulk Entry
            </button>
            <button 
              onClick={() => setActiveSection('reports')} 
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap touch-manipulation ${
                activeSection === 'reports' 
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📋 Report Cards
            </button>
          </div>
        </div>

        {activeSection === 'students' && (
          <div>
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="mobile-heading font-bold text-gradient flex items-center gap-2">
                    👥 Students
                  </h2>
                  <p className="text-gray-600 mt-1 font-medium mobile-text">Manage student records</p>
                </div>
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)} 
                  className="input-field font-medium min-w-0 sm:w-auto"
                >
                  <option value="all">All Classes</option>
                  {levels?.map((level: any) => (
                    <option key={level.level} value={level.level}>{level.level}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                  onClick={exportToExcel} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
                >
                  📄 <span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Export</span>
                </button>
                <button 
                  onClick={() => setShowAddStudent(true)} 
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
                >
                  ➕ <span className="hidden sm:inline">Add Student</span><span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
              </div>
            ) : students?.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">🎓</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No students yet</h3>
                <p className="text-gray-500 text-sm sm:text-base">Click "Add Student" to register your first student</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="responsive-table">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-50 to-teal-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admission No</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Class</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Gender</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students?.map((student: any) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm">{student.admission_no}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="text-gray-900 font-medium text-sm">{student.first_name} {student.last_name}</div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">
                              <span className="inline-block mr-2">{student.class_name || 'N/A'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                student.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                              }`}>
                                {student.gender}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                              {student.class_name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              student.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex gap-1 sm:gap-2">
                              <button 
                                onClick={() => navigate(`/students/${student.id}`)} 
                                className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors duration-150 touch-manipulation"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => setEditingStudent(student)} 
                                className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors duration-150 touch-manipulation"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteStudent(student.id)} 
                                className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors duration-150 touch-manipulation"
                              >
                                Del
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
          </div>
        )}

        {activeSection === 'bulk' && (
          <BulkResultsEntry />
        )}

        {activeSection === 'reports' && (
          <ReportCard students={students || []} />
        )}
      </main>

      {(showAddStudent || editingStudent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col mx-4">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
            </div>
            <form id="studentForm" onSubmit={handleStudentSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 scrollbar-hide">
              {editingStudent && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Admission Number</label>
                  <input value={editingStudent.admission_no} disabled className="input-field bg-gray-100 text-gray-600" />
                </div>
              )}
              {!editingStudent && (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Class *</label>
                    <select name="class_level" required className="input-field">
                      <option value="">Select class</option>
                      {levels?.map((level: any) => (
                        <option key={level.level} value={level.level}>{level.level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Term *</label>
                    <select name="term" required className="input-field">
                      <option value="">Select term</option>
                      <option value="Term1">Term 1</option>
                      <option value="Term2">Term 2</option>
                      <option value="Term3">Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Year *</label>
                    <input name="year" type="number" defaultValue={new Date().getFullYear()} required className="input-field" placeholder="2024" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                <input name="first_name" defaultValue={editingStudent?.first_name} required className="input-field" placeholder="Enter first name" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                <input name="last_name" defaultValue={editingStudent?.last_name} required className="input-field" placeholder="Enter last name" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                <select name="gender" defaultValue={editingStudent?.gender} required className="input-field">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </form>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex gap-2 sm:gap-3 safe-area-bottom">
              <button type="submit" form="studentForm" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg text-sm sm:text-base touch-manipulation">
                {editingStudent ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowAddStudent(false); setEditingStudent(null); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-sm sm:text-base touch-manipulation">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <div className="flex justify-around">
          <button onClick={() => setActiveSection('students')} className={`flex flex-col items-center py-2 px-3 rounded-lg transition touch-manipulation ${activeSection === 'students' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}>
            <span className="text-lg mb-1">👥</span>
            <span className="text-xs font-medium">Students</span>
          </button>
          <button onClick={() => setActiveSection('bulk')} className={`flex flex-col items-center py-2 px-3 rounded-lg transition touch-manipulation ${activeSection === 'bulk' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}>
            <span className="text-lg mb-1">📝</span>
            <span className="text-xs font-medium">Bulk Entry</span>
          </button>
          <button onClick={() => setActiveSection('reports')} className={`flex flex-col items-center py-2 px-3 rounded-lg transition touch-manipulation ${activeSection === 'reports' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}>
            <span className="text-lg mb-1">📋</span>
            <span className="text-xs font-medium">Reports</span>
          </button>
        </div>
      </div>
      
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
