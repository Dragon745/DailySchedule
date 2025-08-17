# Analytics Component Documentation

## 🎯 Component Overview

The Analytics component provides comprehensive insights into time tracking data, displaying statistics, charts, and category breakdowns for productivity analysis.

## 📊 Data Processing Flow

```mermaid
graph TD
    A[Analytics Mounts] --> B[Load Time Tracking Data]
    B --> C[Load Categories Data]
    C --> D[Process Raw Data]

    D --> E[Filter by Time Range]
    E --> F[Group by Categories]
    F --> G[Calculate Statistics]

    G --> H[Total Time]
    G --> I[Total Sessions]
    G --> J[Category Breakdown]
    G --> K[Main vs Sub Categories]

    H --> L[Display Statistics]
    I --> L
    J --> M[Render Charts]
    K --> N[Category Tree]

    L --> O[Update UI]
    M --> O
    N --> O

    style A fill:#ffcdd2
    style G fill:#c8e6c9
    style O fill:#e1f5fe
```

## 🏗️ Component Structure

```mermaid
graph TD
    A[Analytics] --> B[State Management]
    A --> C[Data Processing]
    A --> D[UI Components]
    A --> E[Time Range Logic]

    B --> F[stats]
    B --> G[loading]
    B --> H[timeRange]
    B --> I[error]
    B --> J[expandedCategories]

    C --> K[loadAnalyticsData]
    C --> L[processTimeData]
    C --> M[calculateStatistics]
    C --> N[organizeCategories]

    D --> O[Summary Cards]
    D --> P[Category Breakdown]
    D --> Q[Time Range Selector]
    D --> R[Loading States]

    E --> S[getStartDate]
    E --> T[filterByTimeRange]

    style A fill:#ffcdd2
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#f3e5f5
```

## 📈 Statistics Calculation Flow

```mermaid
flowchart LR
    subgraph "Raw Data"
        A[Time Tracking Sessions]
        B[Category Definitions]
        C[Time Range Filter]
    end

    subgraph "Data Processing"
        D[Session Filtering]
        E[Category Grouping]
        F[Time Aggregation]
    end

    subgraph "Statistics"
        G[Total Time]
        H[Total Sessions]
        I[Category Totals]
        J[Percentage Calculations]
    end

    A --> D
    B --> E
    C --> D

    D --> F
    E --> F

    F --> G
    F --> H
    F --> I
    F --> J

    style A fill:#ffebee
    style D fill:#e8f5e8
    style G fill:#f3e5f5
```

## 🕒 Time Range Processing

```mermaid
flowchart TD
    A[Time Range Selection] --> B{Selected Range}

    B -->|Week| C[Last 7 Days]
    B -->|Month| D[Current Month]
    B -->|Year| E[Current Year]

    C --> F[Calculate Start Date]
    D --> G[Calculate Start Date]
    E --> H[Calculate Start Date]

    F --> I[Filter Sessions]
    G --> I
    H --> I

    I --> J[Update Statistics]
    J --> K[Re-render Charts]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style J fill:#c8e6c9
```

## 🏷️ Category Organization Flow

```mermaid
flowchart TD
    A[Load Categories] --> B[Separate Main & Sub]
    B --> C[Create Category Tree]

    C --> D[Main Categories]
    C --> E[Sub Categories]

    D --> F[Initialize Stats]
    E --> G[Assign to Parents]

    F --> H[Add Sub Categories]
    G --> H

    H --> I[Calculate Totals]
    I --> J[Sort by Time]
    J --> K[Display Tree]

    style A fill:#ffebee
    style C fill:#e8f5e8
    style K fill:#f3e5f5
```

## 📊 Data Visualization Architecture

```mermaid
flowchart LR
    subgraph "Data Layer"
        A[Processed Statistics]
        B[Category Hierarchy]
        C[Time Series Data]
    end

    subgraph "Visualization Components"
        D[Summary Cards]
        E[Progress Bars]
        F[Category Tree]
        G[Time Charts]
    end

    subgraph "Interactive Features"
        H[Expandable Categories]
        I[Time Range Selector]
        J[Sort Options]
    end

    A --> D
    B --> E
    B --> F
    C --> G

    F --> H
    A --> I
    A --> J

    style A fill:#ffebee
    style D fill:#e8f5e8
    style H fill:#f3e5f5
```

## 🎨 UI Layout Structure

```mermaid
graph TD
    A[Analytics Container] --> B[Header Section]
    A --> C[Summary Cards]
    A --> D[Category Breakdown]
    A --> E[Loading States]

    B --> F[Title]
    B --> G[Time Range Selector]

    C --> H[Total Time Card]
    C --> I[Total Sessions Card]

    D --> J[Category List]
    D --> K[Expandable Items]
    D --> L[Progress Bars]

    E --> M[Skeleton Loading]
    E --> N[Error Display]

    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style D fill:#fff3e0
```

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Loaded : Data loaded successfully
    Loading --> Error : Data loading failed

    Loaded --> Refreshing : Time range changed
    Loaded --> Expanding : Category expanded
    Loaded --> Collapsing : Category collapsed

    Refreshing --> Loaded : New data loaded
    Expanding --> Loaded : UI updated
    Collapsing --> Loaded : UI updated

    Error --> Loading : Retry
    Error --> Loaded : Manual refresh

    Loaded --> [*] : Component unmount
```

## 📱 Responsive Design Flow

```mermaid
flowchart TD
    A[Screen Size Detection] --> B{Device Type}

    B -->|Desktop| C[Full Layout]
    B -->|Tablet| D[Adaptive Layout]
    B -->|Mobile| E[Mobile Layout]

    C --> F[Side-by-side Cards]
    D --> G[Stacked Cards]
    E --> H[Full-width Cards]

    F --> I[Desktop Analytics]
    G --> J[Tablet Analytics]
    H --> K[Mobile Analytics]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style I fill:#c8e6c9
```

## 🚀 Key Features

- **Comprehensive Statistics** - Total time, sessions, and category breakdowns
- **Time Range Filtering** - Week, month, and year views
- **Category Hierarchy** - Main and sub-category organization
- **Interactive Charts** - Expandable category trees with progress bars
- **Real-time Updates** - Live data refresh on time range changes
- **Responsive Design** - Optimized for all device sizes
- **Offline Support** - Works with locally stored data

## 🔧 Technical Implementation

- **React Hooks** - useState, useEffect, useCallback, useMemo
- **Data Processing** - Complex aggregation and filtering logic
- **Performance Optimization** - Memoized calculations and rendering
- **IndexedDB Integration** - Local data querying and processing
- **Responsive CSS** - Tailwind CSS with mobile-first approach
- **Error Handling** - Graceful fallbacks and user feedback
- **Loading States** - Skeleton screens and progress indicators
