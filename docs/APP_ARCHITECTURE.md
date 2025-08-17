# DailySchedule App Architecture

## 🏗️ Overall App Flow

```mermaid
graph TD
    A[User Opens App] --> B{First Time User?}
    B -->|Yes| C[Username Input Screen]
    B -->|No| D[Load User Data from IndexedDB]

    C --> E[Save Username to IndexedDB]
    E --> F[Dashboard]
    D --> F

    F --> G{User Action}

    G -->|Manage Categories| H[Category Manager]
    G -->|Track Time| I[Time Tracker]
    G -->|View Analytics| J[Analytics Dashboard]
    G -->|View Schedule| K[Schedule Manager]

    H --> L[CRUD Operations]
    L --> M[IndexedDB Storage]

    I --> N[Start/Stop Timer]
    N --> O[Save Session Data]
    O --> M

    J --> P[Query Time Data]
    P --> Q[Calculate Statistics]
    Q --> R[Display Charts]

    K --> S[View/Edit Schedules]
    S --> M

    M --> T[Data Persistence]
    T --> U[Offline Support]

    style A fill:#e1f5fe
    style F fill:#c8e6c9
    style M fill:#fff3e0
    style U fill:#f3e5f5
```

## 🔄 Data Flow Architecture

```mermaid
flowchart LR
    subgraph "User Interface"
        A[Dashboard]
        B[Components]
    end

    subgraph "Business Logic"
        C[State Management]
        D[Data Processing]
    end

    subgraph "Data Layer"
        E[IndexedDB Service]
        F[Local Storage]
    end

    subgraph "PWA Features"
        G[Service Worker]
        H[Offline Cache]
        I[Install Prompt]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    G --> H
    H --> I
```

## 📱 Component Hierarchy

```mermaid
graph TD
    A[App.js] --> B[UsernameInput]
    A --> C[Dashboard]
    A --> D[PWAInstallPrompt]
    A --> E[PWAUpdateNotification]
    A --> F[OfflineIndicator]

    C --> G[DesktopHeader]
    C --> H[MobileHeader]
    C --> I[CategoryManager]
    C --> J[ScheduleManager]
    C --> K[TimeTracker]
    C --> L[Analytics]

    I --> M[Category CRUD]
    J --> N[Schedule CRUD]
    K --> O[Timer Controls]
    L --> P[Data Visualization]

    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style G fill:#fff3e0
    style H fill:#fff3e0
```

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        datetime createdAt
        datetime updatedAt
    }

    CATEGORIES {
        int id PK
        string name
        string type
        string color
        string icon
        int parentCategoryId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    SCHEDULES {
        int id PK
        int categoryId FK
        string title
        string description
        array daysOfWeek
        time startTime
        time endTime
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    TIME_TRACKING {
        int id PK
        int categoryId FK
        datetime startTime
        datetime endTime
        int duration
        string status
        string notes
        datetime createdAt
        datetime updatedAt
    }

    CATEGORIES ||--o{ SCHEDULES : "has"
    CATEGORIES ||--o{ TIME_TRACKING : "tracks"
    USERS ||--o{ CATEGORIES : "owns"
```

## 🚀 PWA Architecture

```mermaid
graph TD
    A[Web App] --> B[Service Worker Registration]
    B --> C[Cache Strategy]
    C --> D[Offline Support]

    E[Install Prompt] --> F[PWA Installation]
    F --> G[Home Screen App]

    H[Background Sync] --> I[Data Synchronization]
    I --> J[Push Notifications]

    K[Manifest.json] --> L[App Metadata]
    L --> M[Installation Criteria]

    style A fill:#e3f2fd
    style G fill:#c8e6c9
    style M fill:#fff3e0
```

## 🔐 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> AppLoading
    AppLoading --> UsernameInput : No username
    AppLoading --> Dashboard : Username exists

    UsernameInput --> Dashboard : Username entered

    Dashboard --> CategoryManager : Navigate to categories
    Dashboard --> TimeTracker : Navigate to timer
    Dashboard --> Analytics : Navigate to analytics
    Dashboard --> ScheduleManager : Navigate to schedules

    CategoryManager --> Dashboard : Back to dashboard
    TimeTracker --> Dashboard : Back to dashboard
    Analytics --> Dashboard : Back to dashboard
    ScheduleManager --> Dashboard : Back to dashboard

    Dashboard --> [*] : App closed
```

## 📊 Data Processing Pipeline

```mermaid
flowchart LR
    A[Raw Time Data] --> B[Filter by Date Range]
    B --> C[Group by Category]
    C --> D[Calculate Totals]
    D --> E[Generate Statistics]
    E --> F[Create Visualizations]

    G[User Input] --> H[Validation]
    H --> I[Data Transformation]
    I --> J[Storage]

    style A fill:#ffebee
    style F fill:#e8f5e8
    style J fill:#fff3e0
```
