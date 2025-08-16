/**
 * IndexedDB Service for DailySchedule App
 * Handles all database operations including CRUD, validation, and data management
 */

class IndexedDBService {
    constructor() {
        this.dbName = 'DailyScheduleDB';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the IndexedDB database
     */
    async init() {
        if (this.isInitialized) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB initialization failed:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createObjectStores(db);
            };
        });
    }

    /**
     * Create object stores and indexes
     */
    createObjectStores(db) {
        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
            const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            categoriesStore.createIndex('type', 'type', { unique: false });
            categoriesStore.createIndex('parentCategoryId', 'parentCategoryId', { unique: false });
            categoriesStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // Schedules store
        if (!db.objectStoreNames.contains('schedules')) {
            const schedulesStore = db.createObjectStore('schedules', { keyPath: 'id', autoIncrement: true });
            schedulesStore.createIndex('categoryId', 'categoryId', { unique: false });
            schedulesStore.createIndex('isActive', 'isActive', { unique: false });
            schedulesStore.createIndex('daysOfWeek', 'daysOfWeek', { unique: false });
        }

        // TimeTracking store
        if (!db.objectStoreNames.contains('timeTracking')) {
            const timeTrackingStore = db.createObjectStore('timeTracking', { keyPath: 'id', autoIncrement: true });
            timeTrackingStore.createIndex('categoryId', 'categoryId', { unique: false });
            timeTrackingStore.createIndex('status', 'status', { unique: false });
            timeTrackingStore.createIndex('startTime', 'startTime', { unique: false });
        }

        // Users store (for username and preferences)
        if (!db.objectStoreNames.contains('users')) {
            const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            usersStore.createIndex('username', 'username', { unique: true });
        }

        console.log('Object stores created successfully');
    }

    /**
     * Get a single document by ID
     */
    async get(collection, id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all documents from a collection
     */
    async getAll(collection) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Create a new document
     */
    async create(collection, data) {
        await this.init();

        // Add timestamps
        const documentData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            const request = store.add(documentData);

            request.onsuccess = () => {
                documentData.id = request.result;
                resolve(documentData);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update an existing document
     */
    async update(collection, id, data) {
        await this.init();

        // Get existing document first
        const existing = await this.get(collection, id);
        if (!existing) {
            throw new Error(`Document with id ${id} not found in ${collection}`);
        }

        // Update timestamps and merge data
        const updatedData = {
            ...existing,
            ...data,
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            const request = store.put(updatedData);

            request.onsuccess = () => resolve(updatedData);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a document
     */
    async delete(collection, id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Query documents with filters and sorting
     */
    async query(collection, filters = {}, sortOptions = {}) {
        await this.init();

        let results = await this.getAll(collection);

        // Apply filters
        if (filters) {
            results = results.filter(item => {
                return Object.keys(filters).every(key => {
                    if (Array.isArray(filters[key])) {
                        return filters[key].includes(item[key]);
                    }
                    return item[key] === filters[key];
                });
            });
        }

        // Apply sorting
        if (sortOptions.field && sortOptions.direction) {
            results.sort((a, b) => {
                const aVal = a[sortOptions.field];
                const bVal = b[sortOptions.field];

                if (sortOptions.direction === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        return results;
    }

    /**
     * Get documents by index value
     */
    async getByIndex(collection, indexName, value) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export all data as JSON
     */
    async exportData() {
        await this.init();

        const collections = ['categories', 'schedules', 'timeTracking', 'users'];
        const exportData = {};

        for (const collection of collections) {
            exportData[collection] = await this.getAll(collection);
        }

        exportData.exportDate = new Date().toISOString();
        exportData.version = this.version;

        return exportData;
    }

    /**
     * Import data from JSON
     */
    async importData(jsonData) {
        await this.init();

        try {
            // Clear existing data
            await this.clearData();

            // Import data for each collection
            for (const [collection, data] of Object.entries(jsonData)) {
                if (collection !== 'exportDate' && collection !== 'version' && Array.isArray(data)) {
                    for (const item of data) {
                        // Remove id to allow auto-increment
                        const { id, ...itemData } = item;
                        await this.create(collection, itemData);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }

    /**
     * Clear all data
     */
    async clearData() {
        await this.init();

        const collections = ['categories', 'schedules', 'timeTracking', 'users'];

        for (const collection of collections) {
            const transaction = this.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            await store.clear();
        }
    }

    /**
     * Get database size information
     */
    async getDataSize() {
        await this.init();

        const collections = ['categories', 'schedules', 'timeTracking', 'users'];
        const sizes = {};

        for (const collection of collections) {
            const data = await this.getAll(collection);
            sizes[collection] = {
                count: data.length,
                size: JSON.stringify(data).length
            };
        }

        return sizes;
    }

    /**
     * Validate data against schema
     */
    validateData(data, schema) {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            if (rules.required && !data[field]) {
                errors.push(`${field} is required`);
                continue;
            }

            if (data[field]) {
                if (rules.type && typeof data[field] !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }

                if (rules.minLength && data[field].length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }

                if (rules.maxLength && data[field].length > rules.maxLength) {
                    errors.push(`${field} must be no more than ${rules.maxLength} characters`);
                }
            }
        }

        return errors;
    }

    /**
     * Migrate data to new version
     */
    async migrateData(targetVersion) {
        await this.init();

        if (targetVersion <= this.version) {
            return false; // No migration needed
        }

        // Implement migration logic here
        // This would handle schema changes between versions

        return true;
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.isInitialized = false;
        }
    }
}

// Create and export singleton instance
const indexedDBService = new IndexedDBService();
export default indexedDBService;
