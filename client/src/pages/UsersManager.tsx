import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader2, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const startEdit = (user: UserData) => {
    setEditingId(user._id);
    setEditForm({ name: user.name, email: user.email });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', email: '' });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await api.put(`/users/${id}`, editForm);
      setUsers(users.map(u => u._id === id ? { ...u, name: editForm.name, email: editForm.email } : u));
      setEditingId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="h-16 border-b border-gray-200 bg-white flex items-center px-8 shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Role</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => {
                const isEditing = editingId === u._id;
                const isMe = u._id === currentUser?.id;

                return (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-medium">{u.name}</span>
                          {isMe && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-700">You</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{u.email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => saveEdit(u._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => startEdit(u)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(u._id)} 
                            disabled={isMe}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersManager;
