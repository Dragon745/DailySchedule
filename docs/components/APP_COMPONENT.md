# App.js Component Documentation

## 🎯 Component Overview

The main App component serves as the application's root container, managing global state, routing, and PWA functionality.

## 🔄 Component Lifecycle Flow

```mermaid
graph TD
    A[App Mounts] --> B[Initialize State]
    B --> C[Check Username in IndexedDB]
    C --> D{Username Exists?}

    D -->|Yes| E[Load User Data]
    D -->|No| F[Show Username Input]

    E --> G[Render Dashboard]
    F --> H[Wait for Username Input]

    H --> I[Username Submitted]
    I --> J[Save to IndexedDB]
    J --> G

    G --> K[App Running]
    K --> L[Handle PWA Updates]
    K --> M[Handle Offline Status]
    K --> N[Show Install Prompt]

    style A fill:#ffcdd2
    style G fill:#c8e6c9
    style K fill:#e1f5fe
```

## 🏗️ Component Structure

```mermaid
graph TD
    A[App.js] --> B[State Management]
    A --> C[Event Handlers]
    A --> D[Child Components]

    B --> E[username]
    B --> F[currentView]
    B --> G[isOnline]
    B --> H[updateAvailable]

    C --> I[handleUsernameSubmit]
    C --> J[handleViewChange]
    C --> K[handleUpdateAccept]

    D --> L[UsernameInput]
    D --> M[Dashboard]
    D --> N[PWAInstallPrompt]
    D --> O[PWAUpdateNotification]
    D --> P[OfflineIndicator]

    style A fill:#ffcdd2
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#f3e5f5
```

## 🔐 State Management Diagram

```mermaid
stateDiagram-v2
    [*] --> AppInitializing
    AppInitializing --> UsernameInput : No username stored
    AppInitializing --> Dashboard : Username exists

    UsernameInput --> Dashboard : Username submitted
    Dashboard --> CategoryManager : Navigate to categories
    Dashboard --> TimeTracker : Navigate to timer
    Dashboard --> Analytics : Navigate to analytics
    Dashboard --> ScheduleManager : Navigate to schedules

    CategoryManager --> Dashboard : Back navigation
    TimeTracker --> Dashboard : Back navigation
    Analytics --> Dashboard : Back navigation
    ScheduleManager --> Dashboard : Back navigation

    Dashboard --> UsernameInput : Clear username
```

## 📱 PWA Integration Flow

```mermaid
flowchart TD
    A[Service Worker Registration] --> B[Update Detection]
    B --> C{Update Available?}

    C -->|Yes| D[Show Update Notification]
    C -->|No| E[Continue Normal Operation]

    D --> F[User Accepts Update]
    D --> G[User Dismisses Update]

    F --> H[Reload App]
    G --> I[Continue with Old Version]

    J[Install Prompt] --> K[PWA Installation]
    K --> L[Home Screen App]

    style A fill:#e3f2fd
    style D fill:#fff3e0
    style L fill:#c8e6c9
```

## 🔄 Data Flow Architecture

```mermaid
flowchart LR
    subgraph "App State"
        A[username]
        B[currentView]
        C[isOnline]
    end

    subgraph "User Actions"
        D[Username Input]
        E[Navigation]
        F[PWA Actions]
    end

    subgraph "Data Storage"
        G[IndexedDB]
        H[Local Storage]
    end

    subgraph "PWA Features"
        I[Service Worker]
        J[Install Prompt]
        K[Update Notifications]
    end

    A --> G
    D --> A
    E --> B
    F --> I
    I --> J
    I --> K

    style A fill:#ffebee
    style G fill:#e8f5e8
    style I fill:#fff3e0
```

## 🎨 UI Component Layout

```mermaid
graph TD
    A[App Container] --> B[Header Section]
    A --> C[Main Content Area]
    A --> D[PWA Components]

    B --> E[Desktop Header]
    B --> F[Mobile Header]

    C --> G[Username Input]
    C --> H[Dashboard]
    C --> I[Category Manager]
    C --> J[Time Tracker]
    C --> K[Analytics]
    C --> L[Schedule Manager]

    D --> M[Install Prompt]
    D --> N[Update Notification]
    D --> O[Offline Indicator]

    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style D fill:#fff3e0
```

## 🚀 Key Features

- **Global State Management** - Centralized app state
- **Navigation Control** - View switching logic
- **PWA Integration** - Service worker and install prompt
- **Offline Detection** - Network status monitoring
- **Update Management** - App update notifications
- **Responsive Design** - Mobile and desktop layouts

## 🔧 Technical Implementation

- **React Hooks** - useState, useEffect for state management
- **IndexedDB Integration** - Local data persistence
- **Service Worker** - PWA functionality
- **Event Listeners** - Network and PWA event handling
- **Component Composition** - Modular component architecture
