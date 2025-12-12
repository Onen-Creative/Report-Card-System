import { useActivityDialog } from '@/hooks/useActivityDialog';
import ActivityDialog from './ActivityDialog';

export default function ExampleUsage() {
  const { dialog, showSuccess, showError, showConfirm, closeDialog } = useActivityDialog();

  const handleSaveMarks = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Success!', 'Marks saved successfully');
    } catch (error) {
      showError('Error!', 'Failed to save marks. Please try again.');
    }
  };

  const handleDeleteUser = () => {
    showConfirm(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      async () => {
        // Simulate delete API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess('Deleted!', 'User has been deleted successfully');
      },
      'Delete',
      'Cancel'
    );
  };

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={handleSaveMarks}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Save Marks
      </button>
      
      <button
        onClick={handleDeleteUser}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Delete User
      </button>

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