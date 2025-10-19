# Credit Roadmap Feature Documentation

## Overview
A personalized credit improvement roadmap page that uses the Gemini API to dynamically generate the 5 most relevant credit milestones for each user based on their financial profile.

## Files Created/Modified

### 1. New Files Created

#### `client/src/utils/roadmapGenerator.ts`
**Purpose:** Utility functions for generating personalized credit roadmaps using Gemini AI

**Key Functions:**
- `generatePersonalizedRoadmap(userData, allMilestones)`: Main function that calls Gemini API to select personalized milestones
- `getFallbackRoadmap(userData, allMilestones)`: Fallback logic if API fails or is unavailable

**API Integration:**
- Uses `gemini-1.5-flash` model for fast, efficient recommendations
- Implements structured prompting with system and user prompts
- Parses JSON responses from the AI
- Handles markdown code blocks in responses

**Fallback Logic:**
The fallback system categorizes users into credit tiers and provides appropriate recommendations:
- **No Credit/Bad Credit**: Starter cards, monitoring, basic habits
- **Fair Credit**: Building to 700+, utilization management
- **Good Credit**: Advanced rewards, travel points, second cards
- **Excellent Credit**: Premium cards, perfect utilization, optimization

#### `client/src/pages/Roadmap.tsx`
**Purpose:** The main roadmap page component with beautiful UI

**Key Features:**
- Fetches user data from Firebase Firestore
- Generates personalized roadmap on component mount
- Displays milestones in a visually appealing step-by-step format
- Shows difficulty levels with color-coded badges and star ratings
- Displays XP rewards and requirements for each milestone
- Animated entrance effects using Framer Motion
- Summary card showing total milestones, XP, and user level

**UI Components:**
- Loading state with spinner
- Error state with helpful message
- Profile incomplete state (redirects to survey)
- Step-by-step milestone cards with:
  - Numbered circles showing progression
  - Connecting lines between steps
  - Difficulty badges (Easy/Medium/Hard)
  - Tag pills for categorization
  - XP reward displays
  - Requirement indicators
- Summary statistics card

### 2. Modified Files

#### `client/src/App.tsx`
**Changes:**
- Added import for `Roadmap` component
- Added protected route `/roadmap` that requires authentication

#### `client/src/components/Navbar.tsx`
**Changes:**
- Added "Roadmap" link to navigation bar (visible only when logged in)
- Positioned between "Dashboard" and user menu
- Uses consistent styling with other nav links

## Data Flow

```
User Login → Survey Completion → Data Stored in Firestore
                                          ↓
User Visits /roadmap → Roadmap.tsx Component Mounts
                                          ↓
                    Fetch User Data from Firestore
                                          ↓
                Load Milestones from milestone.json
                                          ↓
            Call generatePersonalizedRoadmap()
                                          ↓
                    Gemini API Processing
                                          ↓
            Returns 5 Personalized Milestone IDs
                                          ↓
                Map IDs to Full Milestone Objects
                                          ↓
                    Render Roadmap UI
```

## Gemini API Integration Details

### System Prompt
```
You are a credit roadmap advisor. Given a user's financial data and the available milestones,
select the 5 most relevant milestones that the user should focus on next.
Return only a JSON array of milestone IDs.
```

### User Prompt Structure
- **User Profile:** Full JSON of user's financial data including:
  - Credit score range
  - Annual income
  - Employment status
  - Current credit cards
  - Credit history length
  - Late payment history
  - Credit goals
  - Purchase history

- **Available Milestones:** Complete list from `milestone.json`

- **Rules:**
  - Pick exactly 5 milestones
  - Avoid duplicates
  - Prefer earlier/foundational milestones for users with credit scores below 700
  - Return only JSON array format

### Response Handling
The API returns a JSON array like:
```json
["starter_card", "build_700_score", "add_second_card", "maximize_cashback", "upgrade_card"]
```

The code:
1. Cleans markdown code blocks from response
2. Parses JSON
3. Maps IDs to full milestone objects
4. Ensures exactly 5 results
5. Falls back to rule-based recommendations if API fails

## Milestone Data Structure

Each milestone in `data/milestone.json` contains:
```typescript
{
  id: string;              // Unique identifier
  title: string;           // Display title
  description: string;     // Detailed explanation
  tags: string[];          // Category tags
  difficulty: string;      // "easy", "medium", or "hard"
  requirements: string[];  // Prerequisites (other milestone IDs)
  reward_xp: number;       // Experience points earned
}
```

## Environment Variables

Required in `.env`:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

Already configured in your project.

## Styling & Design

The roadmap uses a modern, colorful design with:
- **Gradient background:** Purple to pink gradient (`from-purple-50 to-pink-50`)
- **Card-based layout:** White cards with shadows and borders
- **Color-coded difficulty:**
  - Easy: Green (`bg-green-100 text-green-800`)
  - Medium: Yellow (`bg-yellow-100 text-yellow-800`)
  - Hard: Red (`bg-red-100 text-red-800`)
- **Animated elements:** Framer Motion for smooth transitions
- **Responsive design:** Works on mobile and desktop

## Usage

### For Users
1. Log in to the application
2. Complete the onboarding survey
3. Navigate to "Roadmap" in the navigation bar
4. View personalized credit improvement steps
5. Follow milestones in order to improve credit score

### For Developers
To modify milestone recommendations:
1. Edit the system/user prompts in `roadmapGenerator.ts`
2. Adjust fallback logic for different credit tiers
3. Add new milestones to `data/milestone.json`
4. Update UI styling in `Roadmap.tsx`

## Error Handling

The implementation includes robust error handling:
- **API Failure:** Falls back to rule-based recommendations
- **Missing User Data:** Shows error message with link to survey
- **Incomplete Profile:** Redirects users to complete survey
- **Loading States:** Shows spinner during data fetch and AI processing
- **Empty States:** Gracefully handles missing purchases or incomplete data

## Performance Considerations

- Gemini API call is made only once on component mount
- Results are cached in component state
- Fallback logic is instant (no API calls)
- Milestone data is loaded from local JSON (fast)
- Animations are GPU-accelerated via Framer Motion

## Future Enhancements

Potential improvements:
1. **Progress Tracking:** Track which milestones users have completed
2. **Milestone Details:** Expandable cards with more detailed guidance
3. **Action Items:** Specific tasks/checklist for each milestone
4. **Notifications:** Remind users about next steps
5. **Social Features:** Share progress with friends
6. **Adaptive Roadmap:** Update recommendations as user progresses
7. **Premium Milestones:** Unlock advanced goals for power users
8. **Integration:** Connect milestones to card recommendations

## Testing

To test the feature:
1. Ensure you have a valid `VITE_GEMINI_API_KEY` in `.env`
2. Log in with a test account
3. Complete the survey with different credit profiles
4. Visit `/roadmap` to see personalized recommendations
5. Try different credit score ranges to see varied milestones

Example test profiles:
- **Beginner:** No credit, never had cards → Should see starter milestones
- **Building:** Fair credit, 1-2 years history → Should see credit-building goals
- **Advanced:** Excellent credit, 5+ years → Should see premium/optimization milestones

## Troubleshooting

### Gemini API Issues
- **Error:** "Error generating personalized roadmap"
- **Solution:** Check API key is valid, falls back to rule-based recommendations

### Empty Roadmap
- **Error:** No milestones shown
- **Solution:** Ensure `milestone.json` exists and contains valid data

### Authentication Issues
- **Error:** Redirected to login
- **Solution:** Route is protected, user must be authenticated

### Profile Incomplete
- **Message:** "Complete your profile"
- **Solution:** User must complete survey and link bank account

## Technical Dependencies

- **Firebase:** User data storage
- **Gemini AI:** Personalized recommendations
- **Framer Motion:** Animations
- **React Router:** Routing and navigation
- **TypeScript:** Type safety
- **Tailwind CSS:** Styling

---

**Created:** 2025-10-19
**Feature Status:** ✅ Ready for Production
