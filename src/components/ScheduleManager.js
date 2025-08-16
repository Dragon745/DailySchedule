import React, { useState, useEffect } from 'react';
import { db } from '../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';

const ScheduleManager = ({ user, goBack, navigateToView }) => {
    const [schedules, setSchedules] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        categoryId: '',
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        isRecurring: true,
        priority: 2
    });

    const daysOfWeekOptions = [
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
        { value: 7, label: 'Sunday' }
    ];

    const priorityOptions = [
        { value: 1, label: 'Low', color: 'text-green-600' },
        { value: 2, label: 'Medium', color: 'text-yellow-600' },
        { value: 3, label: 'High', color: 'text-red-600' }
    ];

    useEffect(() => {
        loadData();
    }, [user, loadData]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            // Load categories
            const categoriesQuery = query(
                collection(db, 'categories'),
                where('uid', '==', user.uid),
                where('isActive', '==', true),
                orderBy('name')
            );
            const categoriesSnapshot = await getDocs(categoriesQuery);
            const categoriesData = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesData);

            // Helper functions for hierarchical display
            // Note: These functions are now defined locally, not on window object

            // Load schedules
            const schedulesQuery = query(
                collection(db, 'schedules'),
                where('uid', '==', user.uid),
                orderBy('startTime')
            );
            const schedulesSnapshot = await getDocs(schedulesQuery);
            const schedulesData = schedulesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSchedules(schedulesData);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId || !formData.title.trim()) {
            alert('Category and title are required');
            return;
        }

        if (formData.daysOfWeek.length === 0) {
            alert('Please select at least one day of the week');
            return;
        }

        try {
            const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
            const scheduleData = {
                uid: user.uid,
                scheduleId: editingSchedule ? editingSchedule.id : `sch_${Date.now()}`,
                categoryId: formData.categoryId,
                categoryName: selectedCategory.name,
                title: formData.title.trim(),
                description: formData.description.trim(),
                startTime: formData.startTime,
                endTime: formData.endTime,
                daysOfWeek: formData.daysOfWeek,
                isRecurring: formData.isRecurring,
                isActive: true,
                priority: formData.priority,
                createdAt: editingSchedule ? editingSchedule.createdAt : new Date(),
                updatedAt: new Date(),
                estimatedDuration: calculateDuration(formData.startTime, formData.endTime)
            };

            if (editingSchedule) {
                // Update existing schedule
                const scheduleRef = doc(db, 'schedules', editingSchedule.id);
                await updateDoc(scheduleRef, scheduleData);
            } else {
                // Create new schedule
                await addDoc(collection(db, 'schedules'), scheduleData);
            }

            // Reset form and reload
            resetForm();
            await loadData();
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert('Error saving schedule. Please try again.');
        }
    };

    const calculateDuration = (startTime, endTime) => {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        return Math.max(0, end - start);
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            categoryId: schedule.categoryId,
            title: schedule.title,
            description: schedule.description || '',
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            daysOfWeek: schedule.daysOfWeek,
            isRecurring: schedule.isRecurring,
            priority: schedule.priority
        });
        setShowForm(true);
    };

    const handleDelete = async (scheduleId) => {
        if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'schedules', scheduleId));
                await loadData();
            } catch (error) {
                console.error('Error deleting schedule:', error);
                alert('Error deleting schedule. Please try again.');
            }
        }
    };

    const handleToggleActive = async (schedule) => {
        try {
            const scheduleRef = doc(db, 'schedules', schedule.id);
            await updateDoc(scheduleRef, {
                isActive: !schedule.isActive,
                updatedAt: new Date()
            });
            await loadData();
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            categoryId: '',
            title: '',
            description: '',
            startTime: '09:00',
            endTime: '10:00',
            daysOfWeek: [1, 2, 3, 4, 5],
            isRecurring: true,
            priority: 2
        });
        setEditingSchedule(null);
        setShowForm(false);
    };

    const toggleDayOfWeek = (day) => {
        setFormData(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day].sort()
        }));
    };

    const getDayLabel = (day) => {
        return daysOfWeekOptions.find(d => d.value === day)?.label || '';
    };

    const getPriorityLabel = (priority) => {
        return priorityOptions.find(p => p.value === priority)?.label || '';
    };

    const getPriorityColor = (priority) => {
        return priorityOptions.find(p => p.value === priority)?.color || '';
    };

    // Helper functions for hierarchical display
    const getMainCategories = () => {
        return categories.filter(cat => cat.type === 'main');
    };

    const getSubCategories = (parentId) => {
        return categories.filter(cat => cat.type === 'sub' && cat.parentCategoryId === parentId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 lg:pb-6">
                {/* Compact Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Schedules</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Schedule</span>
                    </button>
                </div>

                {/* Schedule Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {getMainCategories().map((category) => (
                                            <optgroup key={category.id} label={category.name}>
                                                <option value={category.id}>
                                                    📁 {category.name} (Main)
                                                </option>
                                                {getSubCategories(category.id).map((subCategory) => (
                                                    <option key={subCategory.id} value={subCategory.id}>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;📄 {subCategory.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        {priorityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., Fajr Namaz, Work Meeting, Exercise"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Optional description for this schedule"
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Days of Week *
                                </label>
                                <div className="grid grid-cols-7 gap-2">
                                    {daysOfWeekOptions.map((day) => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleDayOfWeek(day.value)}
                                            className={`p-2 text-sm font-medium rounded-lg border transition-colors ${formData.daysOfWeek.includes(day.value)
                                                ? 'bg-primary-100 border-primary-300 text-primary-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {day.label.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                                    Recurring schedule
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                                >
                                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Schedules List */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Your Schedules ({schedules.length})
                        </h3>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg mb-2">No schedules yet</p>
                            <p className="text-gray-400">Create your first schedule to get started</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {Math.round(schedule.estimatedDuration / 60000)} min
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900">
                                                    {schedule.title}
                                                    {!schedule.isActive && (
                                                        <span className="ml-2 text-sm text-gray-500">(Inactive)</span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-600">{schedule.categoryName}</p>
                                                {schedule.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(schedule.priority)} bg-gray-100`}>
                                                        {getPriorityLabel(schedule.priority)} Priority
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {schedule.daysOfWeek.map(getDayLabel).join(', ')}
                                                    </span>
                                                    {schedule.isRecurring && (
                                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                            Recurring
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleActive(schedule)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {schedule.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Footer Navigation */}

        </div>
    );
};

export default ScheduleManager;
