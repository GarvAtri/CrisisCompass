# CrisisCompass Storytelling Implementation

## 🎯 **What We've Built**

A full-stack humanitarian crisis storytelling system that transforms your notebook analysis into an interactive, narrative-driven experience.

## 🏗️ **Architecture Overview**

### Backend (FastAPI + PostgreSQL)
- **FastAPI server** (`backend/main.py`) with narrative endpoints
- **PostgreSQL schema** (`backend/database_schema.sql`) with pre-calculated crisis scores
- **Materialized views** for performance optimization
- **RESTful API endpoints** for storytelling data

### Frontend (React + TypeScript)
- **StoryCard components** for country crisis visualization
- **InvisibleCrisisMatrix** (bubble chart) for needs vs gaps analysis
- **TemporalTrajectoryChart** for 2024→2025 trend animations
- **ScrollytellingStory** for progressive narrative disclosure
- **Integrated navigation** between map and story views

## 📊 **Key Storytelling Features**

### 1. **Invisible Crisis Matrix**
- **X-axis**: Health needs (people in need)
- **Y-axis**: Funding gap (USD)
- **Bubble size**: Affected population
- **Bubble color**: Crisis severity (red=critical, green=stable)
- **Interactive**: Click bubbles for country details

### 2. **Temporal Trajectories**
- **Animated transitions** between 2024→2025 data
- **Color coding**: Red=worsening, Green=improving, Gray=stable
- **Interactive selection**: Click countries to highlight trends
- **Play controls**: Animate the temporal evolution

### 3. **Scrollytelling Experience**
- **Progressive disclosure**: Narrative unfolds as user scrolls
- **Synchronized visuals**: Charts update with story context
- **4-act structure**: Intro → Analysis → Trends → Conclusion
- **Call-to-action**: Clear next steps for engagement

### 4. **Story Cards**
- **Compact & detailed views** for country crisis data
- **Severity color coding** based on crisis rank
- **Key metrics**: Needs, coverage, funding gaps, trends
- **Interactive modals** for detailed exploration

## 🚀 **Setup Instructions**

### Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Set up PostgreSQL database
createdb crisiscompass
psql crisiscompass < database_schema.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 5. Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd my-humanitarian-map

# 2. Install dependencies (already done)
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173
```

### Data Loading
```python
# Load your notebook data into PostgreSQL
# Use the data processing logic from your Works_try.ipynb
# The backend expects data in the crisis_scores materialized view
```

## 🎨 **Visual Storytelling Techniques**

### **Progressive Disclosure**
- Users scroll through narrative sections
- Each section reveals new insights
- Charts dynamically update to match context

### **Interactive Comparisons**
- Click countries to compare side-by-side
- Filter by crisis severity or trends
- Explore funding gaps vs needs

### **Emotional Impact**
- Color psychology (red for urgency, green for hope)
- Animated transitions show change over time
- Personal stories through country-specific data

## 📱 **User Experience Flow**

1. **Entry**: Choose between Map View or Story View
2. **Story Introduction**: Learn about invisible crises
3. **Matrix Exploration**: Discover crisis patterns visually
4. **Temporal Analysis**: Watch trends evolve over time
5. **Conclusion**: Understand implications and take action

## 🔧 **Technical Implementation Details**

### API Endpoints
- `GET /api/stories/invisible-crises` - Top crisis countries
- `GET /api/stories/crisis-matrix` - Bubble chart data
- `GET /api/stories/temporal-trends` - Time series data
- `GET /api/stories/health-vs-food` - Sector comparison
- `GET /api/stories/country-comparison/{c1}/{c2}` - Side-by-side

### Component Architecture
```
src/
├── components/
│   ├── StoryCard.tsx           # Country crisis cards
│   ├── InvisibleCrisisMatrix.tsx # Bubble chart
│   ├── TemporalTrajectoryChart.tsx # Time series
│   └── ScrollytellingStory.tsx   # Main narrative
├── pages/
│   └── StoryPage.tsx           # Story wrapper
├── types/
│   └── stories.ts             # TypeScript interfaces
└── services/
    └── api.ts                 # API client
```

### Database Optimization
- **Materialized views** for pre-calculated scores
- **Indexes** on frequently queried columns
- **Connection pooling** for performance
- **Refresh functions** for data updates

## 🎯 **Storytelling Impact**

### **Before**: Static Dashboard
- Users see overwhelming data tables
- No narrative context or guidance
- Difficult to identify key insights

### **After**: Interactive Story
- Users discover insights through exploration
- Clear narrative guides interpretation
- Emotional connection through visualization
- Actionable understanding of crises

## 📈 **Metrics for Success**

- **Engagement**: Time spent in story view
- **Completion**: Scroll-through rate
- **Interaction**: Country clicks and comparisons
- **Sharing**: Story page shares and referrals

## 🔄 **Future Enhancements**

1. **Real-time data updates** with WebSocket connections
2. **More visualization types** (Sankey diagrams, heat maps)
3. **User-generated stories** and annotations
4. **Mobile-optimized** scrollytelling experience
5. **Multi-language** support for global accessibility

## 🛠️ **Troubleshooting**

### Common Issues
1. **Backend not connecting**: Check DATABASE_URL in .env
2. **Frontend errors**: Ensure backend is running on port 8000
3. **Data not loading**: Verify database schema and data import
4. **TypeScript errors**: Run `npm run lint` to check issues

### Performance Tips
- Use materialized views for complex queries
- Implement pagination for large datasets
- Add loading states for better UX
- Consider caching for frequently accessed data

---

**This implementation transforms your humanitarian data analysis into an engaging, narrative-driven experience that helps users understand and connect with crisis situations worldwide.**
