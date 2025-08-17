# TimeTracker Component Documentation

## 🎯 Component Overview

The TimeTracker component manages time tracking functionality, allowing users to start, stop, and manage time tracking sessions for different categories.

## ⏱️ Timer State Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Running : Start Timer
    Running --> Paused : Pause Timer
    Running --> Stopped : Stop Timer
    Paused --> Running : Resume Timer
    Paused --> Stopped : Stop Timer
    Stopped --> Idle : Reset Timer
    Stopped --> Running : Start New Timer

    note right of Idle : No active timer
    note right of Running : Timer counting up
    note right of Paused : Timer paused
    note right of Stopped : Session completed
```

## 🔄 Component Lifecycle Flow

```mermaid
graph TD
    A[TimeTracker Mounts] --> B[Load Categories]
    B --> C[Initialize Timer State]
    C --> D[Set Up Event Listeners]

    D --> E[Timer Ready]
    E --> F{User Action}

    F -->|Start Timer| G[Start Counting]
    F -->|Select Category| H[Update Category]
    F -->|View History| I[Load Sessions]

    G --> J[Timer Running]
    J --> K{User Action}

    K -->|Pause| L[Pause Timer]
    K -->|Stop| M[Stop Timer]
    K -->|Continue| N[Resume Timer]

    L --> O[Timer Paused]
    M --> P[Save Session]
    N --> J

    O --> Q{User Action}
    Q -->|Resume| J
    Q -->|Stop| P

    P --> R[Session Complete]
    R --> S[Update IndexedDB]
    S --> T[Reset Timer]
    T --> E

    style A fill:#ffcdd2
    style E fill:#c8e6c9
    style J fill:#e1f5fe
    style R fill:#fff3e0
```

## 🏗️ Component Structure

```mermaid
graph TD
    A[TimeTracker] --> B[State Management]
    A --> C[Timer Logic]
    A --> D[UI Components]
    A --> E[Data Operations]

    B --> F[isRunning]
    B --> G[isPaused]
    B --> H[currentCategory]
    B --> I[elapsedTime]
    B --> J[sessions]

    C --> K[useInterval Hook]
    C --> L[Timer Controls]
    C --> M[Time Formatting]

    D --> N[Category Selector]
    D --> O[Timer Display]
    D --> P[Control Buttons]
    D --> Q[Session History]

    E --> R[Save Session]
    E --> S[Load Sessions]
    E --> T[Update Sessions]

    style A fill:#ffcdd2
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#f3e5f5
```

## ⏰ Timer Control Flow

```mermaid
flowchart TD
    A[Timer State] --> B{Current Status}

    B -->|Idle| C[Show Start Button]
    B -->|Running| D[Show Pause/Stop]
    B -->|Paused| E[Show Resume/Stop]

    C --> F[User Clicks Start]
    D --> G[User Clicks Pause/Stop]
    E --> H[User Clicks Resume/Stop]

    F --> I[Start Timer]
    G --> J[Pause/Stop Timer]
    H --> K[Resume/Stop Timer]

    I --> L[Update Display]
    J --> M[Update Display]
    K --> L

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style L fill:#c8e6c9
```

## 📊 Session Management Flow

```mermaid
flowchart LR
    subgraph "Session Creation"
        A[Timer Started]
        B[Category Selected]
        C[Time Elapsed]
    end

    subgraph "Session Data"
        D[Start Time]
        E[End Time]
        F[Duration]
        G[Category ID]
    end

    subgraph "Data Storage"
        H[IndexedDB]
        I[Session History]
        J[Analytics Data]
    end

    A --> D
    B --> G
    C --> F

    D --> H
    E --> H
    F --> H
    G --> H

    H --> I
    H --> J

    style A fill:#ffebee
    style D fill:#e8f5e8
    style H fill:#f3e5f5
```

## 🎨 UI Layout Structure

```mermaid
graph TD
    A[TimeTracker Container] --> B[Header Section]
    A --> C[Main Timer Area]
    A --> D[Control Section]
    A --> E[Session History]

    B --> F[Back Navigation]
    B --> G[Title]

    C --> H[Category Selector]
    C --> I[Timer Display]
    C --> J[Current Session Info]

    D --> K[Start Button]
    D --> L[Pause Button]
    D --> M[Stop Button]
    D --> N[Reset Button]

    E --> O[Session List]
    E --> P[Session Details]

    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style D fill:#fff3e0
```

## 🔄 Data Flow Architecture

```mermaid
flowchart TD
    subgraph "User Input"
        A[Category Selection]
        B[Timer Controls]
        C[Session Notes]
    end

    subgraph "Timer Processing"
        D[Time Calculation]
        E[State Management]
        F[Event Handling]
    end

    subgraph "Data Persistence"
        G[Session Creation]
        H[IndexedDB Storage]
        I[Data Validation]
    end

    subgraph "UI Updates"
        J[Timer Display]
        K[Button States]
        L[Session List]
    end

    A --> D
    B --> E
    C --> G

    D --> J
    E --> K
    F --> L

    G --> H
    H --> I

    style A fill:#ffebee
    style D fill:#e8f5e8
    style H fill:#f3e5f5
```

## 📱 Mobile Optimization Flow

```mermaid
flowchart TD
    A[Device Detection] --> B{Screen Size}

    B -->|Large| C[Desktop Layout]
    B -->|Medium| D[Tablet Layout]
    B -->|Small| E[Mobile Layout]

    C --> F[Side-by-side Layout]
    D --> G[Stacked Layout]
    E --> H[Full-screen Timer]

    F --> I[Timer + History]
    G --> J[Timer + History]
    H --> K[Timer Focused]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style I fill:#c8e6c9
```

## 🚀 Key Features

- **Real-time Timer** - Live countdown with millisecond precision
- **Category Selection** - Choose activity category before starting
- **Session Management** - Start, pause, resume, and stop tracking
- **Data Persistence** - Save sessions to IndexedDB
- **Session History** - View and manage past tracking sessions
- **Responsive Design** - Optimized for all device sizes
- **Offline Support** - Works without internet connection

## 🔧 Technical Implementation

- **React Hooks** - useState, useEffect, useCallback, useInterval
- **Timer Logic** - Custom interval management for accurate timing
- **State Management** - Complex timer state handling
- **IndexedDB Integration** - Local session storage
- **Event Handling** - User interaction and timer controls
- **Performance Optimization** - Efficient re-renders and updates
- **Mobile-First Design** - Responsive CSS with Tailwind
