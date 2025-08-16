import React, { useState, useEffect } from 'react';
import { db } from '../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';

const CategoryManager = ({ user, goBack, navigateToView }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'default',
        type: 'sub', // Only allow sub-categories now
        parentCategoryId: '' // Required for sub-categories
    });
    const [editingCategory, setEditingCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);


    // Predefined main categories
    const predefinedMainCategories = [
        { id: 'predefined-worship-spiritual', name: 'Worship & Spiritual', color: '#8B5CF6', icon: '🙏' },
        { id: 'predefined-study-learning', name: 'Study & Learning', color: '#3B82F6', icon: '📚' },
        { id: 'predefined-work-income', name: 'Work / Income', color: '#10B981', icon: '💼' },
        { id: 'predefined-personal-projects', name: 'Personal Projects', color: '#F59E0B', icon: '🚀' },
        { id: 'predefined-opportunities-challenges', name: 'Opportunities & Challenges', color: '#EF4444', icon: '🎯' },
        { id: 'predefined-family-relationships', name: 'Family & Relationships', color: '#EC4899', icon: '👨‍👩‍👧‍👦' },
        { id: 'predefined-self-care-rest', name: 'Self-Care & Rest', color: '#06B6D4', icon: '🧘' },
        { id: 'predefined-admin-miscellaneous', name: 'Admin & Miscellaneous', color: '#6B7280', icon: '⚙️' }
    ];

    const iconOptions = [
        { value: 'default', icon: '📋', label: 'Default' },
        { value: 'study', icon: '📚', label: 'Study' },
        { value: 'work', icon: '💼', label: 'Work' },
        { value: 'exercise', icon: '🏃', label: 'Exercise' },
        { value: 'prayer', icon: '🙏', label: 'Prayer' },
        { value: 'family', icon: '👨‍👩‍👧‍👦', label: 'Family' },
        { value: 'health', icon: '🏥', label: 'Health' },
        { value: 'hobby', icon: '🎨', label: 'Hobby' },
        { value: 'social', icon: '👥', label: 'Social' },
        { value: 'admin', icon: '⚙️', label: 'Admin' }
    ];

    const colorOptions = [
        { value: '#3B82F6', label: 'Blue', name: 'Blue' },
        { value: '#10B981', label: 'Green', name: 'Green' },
        { value: '#F59E0B', label: 'Yellow', name: 'Yellow' },
        { value: '#EF4444', label: 'Red', name: 'Red' },
        { value: '#8B5CF6', label: 'Purple', name: 'Purple' },
        { value: '#EC4899', label: 'Pink', name: 'Pink' },
        { value: '#06B6D4', label: 'Cyan', name: 'Cyan' },
        { value: '#6B7280', label: 'Gray', name: 'Gray' },
        { value: '#059669', label: 'Emerald', name: 'Emerald' },
        { value: '#DC2626', label: 'Crimson', name: 'Crimson' },
        { value: '#7C3AED', label: 'Violet', name: 'Violet' },
        { value: '#F97316', label: 'Orange', name: 'Orange' },
        { value: '#0891B2', label: 'Sky', name: 'Sky' },
        { value: '#BE185D', label: 'Rose', name: 'Rose' },
        { value: '#059669', label: 'Teal', name: 'Teal' }
    ];

    useEffect(() => {
        if (user) {
            loadCategories();
        }
    }, [user, loadCategories]);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);

            // Load user categories
            const q = query(
                collection(db, 'categories'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const categoriesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesData);



            // Reload categories after initialization
            const updatedQuerySnapshot = await getDocs(q);
            const updatedCategoriesData = updatedQuerySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(updatedCategoriesData);



            // Helper functions for hierarchical display
            // Note: These functions are now defined locally, not on window object
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);





    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            // Check if this sub-category already exists
            const existingSubCategory = categories.find(cat =>
                cat.type === 'sub' &&
                cat.name.toLowerCase() === formData.name.toLowerCase() &&
                cat.parentCategoryId === formData.parentCategoryId
            );

            if (existingSubCategory && !editingCategory) {
                alert('A sub-category with this name already exists under the selected parent category.');
                return;
            }

            // Get the selected parent category
            const selectedParentCategory = predefinedMainCategories.find(cat => cat.id === formData.parentCategoryId);

            if (!selectedParentCategory) {
                alert('Please select a valid parent category.');
                return;
            }

            // Check if the main category exists in Firestore, if not create it
            const existingMainCategory = categories.find(cat =>
                cat.type === 'main' && cat.categoryId === formData.parentCategoryId
            );

            if (!existingMainCategory) {
                // Create the main category first
                const mainCategoryData = {
                    uid: user.uid,
                    categoryId: selectedParentCategory.id,
                    name: selectedParentCategory.name,
                    description: `Main category: ${selectedParentCategory.name}`,
                    color: selectedParentCategory.color,
                    icon: selectedParentCategory.icon,
                    type: 'main',
                    parentCategoryId: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    totalTimeSpent: 0,
                    totalSessions: 0
                };

                await addDoc(collection(db, 'categories'), mainCategoryData);
                console.log(`Created main category: ${selectedParentCategory.name}`);
            }

            // Now create/update the sub-category
            const categoryData = {
                uid: user.uid,
                categoryId: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
                name: formData.name,
                description: formData.description,
                color: formData.color,
                icon: formData.icon,
                type: 'sub',
                parentCategoryId: formData.parentCategoryId,
                isActive: true,
                createdAt: editingCategory ? editingCategory.createdAt : new Date(),
                updatedAt: new Date(),
                totalTimeSpent: editingCategory ? editingCategory.totalTimeSpent || 0 : 0,
                totalSessions: editingCategory ? editingCategory.totalSessions || 0 : 0
            };

            if (editingCategory) {
                await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
            } else {
                await addDoc(collection(db, 'categories'), categoryData);
            }

            resetForm();
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error saving category. Please try again.');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color || '#3B82F6',
            icon: category.icon || 'default',
            type: 'sub', // Always sub for editing
            parentCategoryId: category.parentCategoryId || ''
        });
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteDoc(doc(db, 'categories', categoryId));
                loadCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    // handleToggleActive function removed as it's not used

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#3B82F6',
            icon: 'default',
            type: 'sub',
            parentCategoryId: ''
        });
        setEditingCategory(null);
        setShowForm(false);
    };

    // Get main categories (predefined + user-created)
    const getMainCategories = () => {
        const userMainCategories = categories.filter(cat => cat.type === 'main');

        // Map predefined categories to match the structure from Firestore
        const predefinedFromFirestore = predefinedMainCategories.map(predefined => {
            const existing = userMainCategories.find(cat => cat.categoryId === predefined.id);
            if (existing) {
                return existing; // Use the Firestore version if it exists
            }
            // Return a fallback version if not in Firestore yet
            return {
                id: predefined.id,
                categoryId: predefined.id,
                name: predefined.name,
                description: `Predefined main category: ${predefined.name}`,
                color: predefined.color,
                icon: predefined.icon,
                type: 'main',
                parentCategoryId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                totalTimeSpent: 0,
                totalSessions: 0
            };
        });

        return [...predefinedFromFirestore, ...userMainCategories.filter(cat => !cat.categoryId.startsWith('predefined-'))];
    };

    // Get sub-categories for a specific main category
    const getSubCategories = (parentId) => {
        return categories.filter(cat => cat.type === 'sub' && cat.parentCategoryId === parentId);
    };

    // getSubCategoriesByParent function removed as it's not used

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 lg:pb-6">
                {/* Compact Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add New</span>
                    </button>
                </div>

                {/* Rest of your existing CategoryManager content goes here */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 animate-pulse shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tree-like Category Display */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                                All Categories
                            </h2>
                            <div className="space-y-3">
                                {getMainCategories().map((mainCategory) => {
                                    const subCategories = getSubCategories(mainCategory.categoryId);
                                    return (
                                        <div key={mainCategory.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                                            {/* Main Category Header */}
                                            <div className="p-5 border-b border-gray-100/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
                                                            style={{ backgroundColor: mainCategory.color + '20' }}
                                                        >
                                                            <span style={{ color: mainCategory.color }}>{mainCategory.icon}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-lg">{mainCategory.name}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {subCategories.length} sub-categories
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary-700 rounded-full font-medium">
                                                            Main
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub-categories Tree */}
                                            {subCategories.length > 0 ? (
                                                <div className="divide-y divide-gray-100/50">
                                                    {subCategories
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map((subCategory, index) => (
                                                            <div key={subCategory.id} className="p-4 pl-8 bg-gray-50/50">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-4">
                                                                        {/* Tree connector line */}
                                                                        <div className="relative">
                                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner"
                                                                                style={{ backgroundColor: subCategory.color + '20' }}
                                                                            >
                                                                                <div
                                                                                    className="w-4 h-4 rounded-full shadow-sm"
                                                                                    style={{ backgroundColor: subCategory.color }}
                                                                                ></div>
                                                                            </div>
                                                                            {/* Vertical line connector */}
                                                                            {index < subCategories.length - 1 && (
                                                                                <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200"></div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-medium text-gray-900">{subCategory.name}</h4>
                                                                            <p className="text-sm text-gray-500">
                                                                                {subCategory.description || 'No description'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${subCategory.isActive
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {subCategory.isActive ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                        <div className="flex items-center space-x-1">
                                                                            <button
                                                                                onClick={() => handleEdit(subCategory)}
                                                                                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(subCategory.id)}
                                                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-500 text-sm">No sub-categories yet</p>
                                                    <button
                                                        onClick={() => setShowForm(true)}
                                                        className="mt-2 text-primary hover:text-primary-600 text-sm font-medium"
                                                    >
                                                        Add first sub-category
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Empty State for No Categories */}
                        {categories.length === 0 && (
                            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-200/50 shadow-lg">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">No categories yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first sub-category to start organizing your activities and tracking your time effectively</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Create First Category
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white w-full h-full sm:h-auto sm:max-w-md rounded-none sm:rounded-2xl shadow-2xl border-t-4 border-primary overflow-y-auto">
                        {/* Mobile Header Bar */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:hidden">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Desktop Header (hidden on mobile) */}
                            <div className="hidden sm:flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-2">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm text-base"
                                        placeholder="Enter category name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-2">
                                        Parent Category
                                    </label>
                                    <select
                                        value={formData.parentCategoryId}
                                        onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                                        className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm text-base"
                                        required
                                    >
                                        <option value="">Select a parent category</option>
                                        {predefinedMainCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.icon} {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm text-base resize-none"
                                        placeholder="Optional description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-4 sm:mb-3">
                                        Color
                                    </label>
                                    <div className="grid grid-cols-6 gap-3 sm:grid-cols-5 sm:gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: color.value })}
                                                className={`w-14 h-14 sm:w-12 sm:h-12 rounded-xl border-2 transition-all duration-200 shadow-sm ${formData.color === color.value
                                                    ? 'border-gray-800 scale-110 shadow-lg ring-2 ring-primary-200'
                                                    : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-2">
                                        Icon
                                    </label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm text-base"
                                    >
                                        {iconOptions.map((icon) => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.icon} {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mobile Action Buttons */}
                                <div className="pt-6 sm:pt-4">
                                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="w-full sm:flex-1 px-6 py-4 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full sm:flex-1 px-6 py-4 sm:py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
                                        >
                                            {editingCategory ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Footer Navigation */}

        </div>
    );
};

export default CategoryManager;
