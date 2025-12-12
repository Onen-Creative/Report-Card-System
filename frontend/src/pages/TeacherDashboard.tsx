import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { schoolsApi, resultsApi, studentsApi, classesApi } from '@/services/api';
import BulkResultsEntry from './BulkResultsEntry';
import type { User } from '@/types';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user: User = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState<'entry' | 'view'>('entry');
  const [viewClass, setViewClass] = useState<string>('');
  const [viewStudent, setViewStudent] = useState<string>('');
  const [viewTerm, setViewTerm] = useState('Term1');
  const [viewYear, setViewYear] = useState(2025);

  const { data: levels } = useQuery({
    queryKey: ['class-levels'],
    queryFn: () => classesApi.getLevels(),
  });

  const { data: students } = useQuery({
    queryKey: ['students', viewClass, viewTerm, viewYear],
    queryFn: () => studentsApi.list({ class_level: viewClass, term: viewTerm, year: viewYear }),
    enabled: !!viewClass,
  });

  const { data: userSchool } = useQuery({
    queryKey: ['school', user.school_id],
    queryFn: () => schoolsApi.get(user.school_id),
    enabled: !!user.school_id,
  });

  const { data: results } = useQuery({
    queryKey: ['results', viewStudent, viewTerm, viewYear],
    queryFn: () => resultsApi.getByStudent(viewStudent, { term: viewTerm, year: String(viewYear) }),
    enabled: !!viewStudent,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16 sm:pb-0">
      <nav className="bg-white shadow-xl border-b border-gray-100 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto mobile-padding py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                Teacher Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium truncate">{userSchool?.name || 'Loading...'}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-xl border border-blue-100 flex-shrink-0">
                <p className="text-xs sm:text-sm font-semibold text-blue-900 truncate max-w-32 sm:max-w-none">{user.full_name}</p>
                <p className="text-xs text-blue-600 capitalize">{user.role?.replace('_', ' ')}</p>
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
              onClick={() => setActiveTab('entry')} 
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap touch-manipulation ${
                activeTab === 'entry' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📝 Enter Marks
            </button>
            <button 
              onClick={() => setActiveTab('view')} 
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap touch-manipulation ${
                activeTab === 'view' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              👁️ View Marks
            </button>
          </div>
        </div>

        {activeTab === 'entry' && <BulkResultsEntry />}

        {activeTab === 'view' && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <h2 className="mobile-heading font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              📈 View Student Marks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Class</label>
                <select 
                  value={viewClass} 
                  onChange={(e) => setViewClass(e.target.value)} 
                  className="input-field"
                >
                  <option value="">Select Class</option>
                  {levels?.map((level: any) => <option key={level.level} value={level.level}>{level.level}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Student</label>
                <select 
                  value={viewStudent} 
                  onChange={(e) => setViewStudent(e.target.value)} 
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={!viewClass}
                >
                  <option value="">Select Student</option>
                  {students?.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Term</label>
                <select 
                  value={viewTerm} 
                  onChange={(e) => setViewTerm(e.target.value)} 
                  className="input-field"
                >
                  <option>Term1</option>
                  <option>Term2</option>
                  <option>Term3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input 
                  type="number" 
                  value={viewYear} 
                  onChange={(e) => setViewYear(Number(e.target.value))} 
                  className="input-field" 
                />
              </div>
            </div>
            {viewStudent && (
              <div className="responsive-table rounded-xl border border-gray-200">
                {results && results.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">CA</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Exam</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result: any) => (
                        <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-sm">{result.subject_name}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-700 text-sm">{result.raw_marks?.ca || '—'}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-700 text-sm">{result.raw_marks?.exam || '—'}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-sm">{result.raw_marks?.total || '—'}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                              result.final_grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                              result.final_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                              result.final_grade === 'C' ? 'bg-amber-100 text-amber-700' :
                              result.final_grade === 'D' ? 'bg-orange-100 text-orange-700' :
                              result.final_grade === 'E' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {result.final_grade || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">📄</div>
                    <p className="text-gray-500 text-base sm:text-lg">No marks found for this student</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{viewTerm} {viewYear}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <div className="flex justify-around">
          <button onClick={() => setActiveTab('entry')} className={`flex flex-col items-center py-2 px-3 rounded-lg transition touch-manipulation ${activeTab === 'entry' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}>
            <span className="text-lg mb-1">📝</span>
            <span className="text-xs font-medium">Enter</span>
          </button>
          <button onClick={() => setActiveTab('view')} className={`flex flex-col items-center py-2 px-3 rounded-lg transition touch-manipulation ${activeTab === 'view' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}>
            <span className="text-lg mb-1">👁️</span>
            <span className="text-xs font-medium">View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
