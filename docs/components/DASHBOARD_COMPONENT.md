# Dashboard Component Documentation

## 🎯 Component Overview

The Dashboard component serves as the main navigation hub, displaying quick stats and providing access to all app features.

## 🔄 Component Lifecycle Flow

```mermaid
graph TD
    A[Dashboard Mounts] --> B[Load User Data]
    B --> C[Fetch Categories from IndexedDB]
    C --> D[Fetch Recent Time Tracking]
    D --> E[Calculate Quick Stats]

    E --> F[Render Dashboard UI]
    F --> G[Display Navigation Cards]
    F --> H[Show Quick Statistics]
    F --> I[Render Recent Activity]

    G --> J[User Navigation]
    H --> K[Data Updates]
    I --> L[Activity Monitoring]

    J --> M[Navigate to Component]
    K --> N[Refresh Stats]
    L --> O[Update Activity Feed]

    style A fill:#ffcdd2
    style F fill:#c8e6c9
    style J fill:#e1f5fe
```

## 🏗️ Component Structure

```mermaid
graph TD
    A[Dashboard] --> B[State Management]
    A --> C[Data Fetching]
    A --> D[UI Components]
    A --> E[Event Handlers]

    B --> F[username]
    B --> G[categories]
    B --> H[recentActivity]
    B --> I[quickStats]

    C --> J[loadDashboardData]
    C --> K[fetchCategories]
    C --> L[fetchRecentActivity]

    D --> M[Header Components]
    D --> N[Navigation Cards]
    D --> O[Statistics Display]
    D --> P[Activity Feed]

    E --> Q[handleNavigation]
    E --> R[handleRefresh]
    E --> S[handleCategoryClick]

    style A fill:#ffcdd2
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#f3e5f5
```

## 🧭 Navigation Flow

```mermaid
flowchart TD
    A[User on Dashboard] --> B{Click Navigation Card}

    B -->|Categories| C[Category Manager]
    B -->|Time Tracker| D[Time Tracker]
    B -->|Analytics| E[Analytics]
    B -->|Schedules| F[Schedule Manager]

    C --> G[Manage Categories]
    D --> H[Track Time]
    E --> I[View Statistics]
    F --> J[Manage Schedules]

    G --> K[Return to Dashboard]
    H --> K
    I --> K
    J --> K

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style K fill:#c8e6c9
```

## 📊 Data Loading Architecture

```mermaid
flowchart LR
    subgraph "Data Sources"
        A[IndexedDB Categories]
        B[IndexedDB Time Tracking]
        C[IndexedDB Schedules]
    end

    subgraph "Data Processing"
        D[Category Aggregation]
        E[Time Calculation]
        F[Activity Sorting]
    end

    subgraph "Dashboard Display"
        G[Navigation Cards]
        H[Quick Stats]
        I[Recent Activity]
    end

    A --> D
    B --> E
    C --> F

    D --> G
    E --> H
    F --> I

    style A fill:#ffebee
    style D fill:#e8f5e8
    style G fill:#f3e5f5
```

## 🎨 UI Layout Structure

```mermaid
graph TD
    A[Dashboard Container] --> B[Header Section]
    A --> C[Main Content]
    A --> D[Footer Navigation]

    B --> E[Desktop Header]
    B --> F[Mobile Header]

    C --> G[Welcome Message]
    C --> H[Navigation Grid]
    C --> I[Quick Statistics]
    C --> J[Recent Activity]

    H --> K[Categories Card]
    H --> L[Time Tracker Card]
    H --> M[Analytics Card]
    H --> N[Schedules Card]

    D --> O[Mobile Footer Nav]

    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style H fill:#fff3e0
```

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> DashboardLoading
    DashboardLoading --> DashboardLoaded : Data loaded
    DashboardLoading --> DashboardError : Error occurred

    DashboardLoaded --> DataRefreshing : Refresh triggered
    DashboardLoaded --> Navigating : User navigation

    DataRefreshing --> DashboardLoaded : Refresh complete
    Navigating --> DashboardLoaded : Return to dashboard

    DashboardError --> DashboardLoading : Retry
    DashboardError --> DashboardLoaded : Manual refresh
```

## 📱 Responsive Design Flow

```mermaid
flowchart TD
    A[Screen Size Detection] --> B{Device Type}

    B -->|Desktop| C[Desktop Layout]
    B -->|Tablet| D[Tablet Layout]
    B -->|Mobile| E[Mobile Layout]

    C --> F[Side Navigation]
    D --> G[Grid Layout]
    E --> H[Stack Layout]

    F --> I[Full Dashboard View]
    G --> I
    H --> J[Mobile Optimized View]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style I fill:#c8e6c9
```

## 🚀 Key Features

- **Central Navigation Hub** - Access to all app features
- **Quick Statistics** - Overview of user's activity
- **Recent Activity Feed** - Latest time tracking sessions
- **Responsive Design** - Optimized for all device sizes
- **Real-time Updates** - Live data refresh capabilities
- **User Welcome** - Personalized greeting and navigation

## 🔧 Technical Implementation

- **React Hooks** - useState, useEffect, useCallback
- **IndexedDB Integration** - Local data fetching
- **Responsive CSS** - Tailwind CSS with mobile-first approach
- **Component Composition** - Modular UI components
- **Event Handling** - Navigation and data refresh logic
- **Performance Optimization** - Memoized data loading
