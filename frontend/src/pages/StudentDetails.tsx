import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentsApi, marksApi, reportsApi } from '@/services/api';

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.get(id!),
  });

  const { data: marks } = useQuery({
    queryKey: ['student-marks', id],
    queryFn: () => marksApi.getByStudent(id!),
  });

  const { data: reports } = useQuery({
    queryKey: ['student-reports', id],
    queryFn: () => reportsApi.getByStudent(id!),
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Student Details</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Admission No</p>
              <p className="font-semibold">{student?.admission_no}</p>
            </div>
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{student?.first_name} {student?.last_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-semibold">{student?.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-semibold">{student?.dob}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Marks</h2>
          {marks && marks.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Assessment</th>
                  <th className="text-left py-2">Marks</th>
                  <th className="text-left py-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark: any) => (
                  <tr key={mark.id} className="border-b">
                    <td className="py-2">{mark.assessment?.subject?.name}</td>
                    <td className="py-2">{mark.assessment?.assessment_type}</td>
                    <td className="py-2">{mark.marks_obtained}</td>
                    <td className="py-2">{mark.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No marks recorded yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Report Cards</h2>
          {reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{report.term} {report.year}</p>
                    <p className="text-sm text-gray-600">Status: {report.status}</p>
                  </div>
                  {report.pdf_url && (
                    <a
                      href={report.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No report cards generated yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
