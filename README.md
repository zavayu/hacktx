
# CreditMob

**CreditMob** is a modern web application that empowers anyone to take control of their credit journey—no matter their starting point. Our mission is to make credit education accessible, actionable, and even fun.

## Why CreditMob?

Millions of people struggle with building or improving their credit, often due to confusing advice, lack of transparency, or simply not knowing where to start. CreditMob changes that by providing:

- **Personalized, step-by-step guidance** that adapts to your unique financial situation
- **Clear, actionable milestones** so you always know your next best move
- **Celebratory progress tracking** to keep you motivated
- **Smart recommendations** for credit cards and habits that fit your goals

### The Impact

- **Demystifies credit:** Breaks down complex credit concepts into easy-to-follow steps
- **Promotes financial inclusion:** Helps users with no credit, bad credit, or limited knowledge get started and succeed
- **Empowers better decisions:** Recommends the right cards and actions based on real data, not ads
- **Builds lifelong habits:** Encourages responsible credit use, payment history, and financial health

CreditMob is more than a tool—it's a companion for your financial journey, designed to help you unlock opportunities, save money, and achieve your goals.

---

## 🚀 Features

- **Personalized Credit Roadmap**
  - AI-powered, Duolingo-style roadmap that guides users through 20+ credit-building milestones
  - Gemini AI integration for dynamic, user-specific milestone selection
  - Celebration animations and XP rewards for completed steps

- **Interactive Survey**
  - Onboarding survey collects key financial and credit data
  - Credit card selection powered by a live credit card database (54+ cards, searchable)
  - Data stored securely in Firebase Firestore

- **Intelligent Credit Card Matching**
  - Advanced matching algorithm using **cosine similarity** to find the best cards for your profile
  - Analyzes your credit score, spending patterns, income, and financial goals
  - Compares your profile against 54+ cards to surface the top matches
  - Provides percentage match scores and detailed eligibility insights
  - Uses vector embeddings to measure how closely your profile aligns with card requirements

- **Financial Insights Dashboard**
  - Visualize spending by category with charts and analytics
  - Track progress, see XP, and monitor completed milestones

- **Modern UI/UX**
  - Responsive, mobile-friendly design
  - Beautiful gradients, animations, and intuitive navigation
  - Accessible and easy to use for all experience levels

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Firebase Firestore (user data), FastAPI (optional for advanced features)
- **AI:** Gemini API (Google Generative AI)
- **Credit Card Data:** [credit-card-db-api](https://www.npmjs.com/package/credit-card-db-api) — created and maintained by the CreditMob team
- **Authentication:** Firebase Auth (email/password, Google)
- **Visualization:** Recharts

---

## 📝 How It Works

1. **Sign Up & Survey**
	- New users complete a quick onboarding survey about their credit, income, and goals.
	- Users can search and select their current credit cards from a live database.

2. **Personalized Roadmap**
	- Gemini AI analyzes the user's profile and selects the 5 most relevant milestones from a pool of 20+.
	- The roadmap is displayed as an interactive, Duolingo-style path. All milestones are always accessible.

3. **Track Progress & Celebrate**
	- Users mark milestones as complete, earning XP and triggering celebration animations.
	- Progress is tracked and visualized on the dashboard.

4. **Get Matched with Credit Cards**
	- CreditMob's intelligent matching engine analyzes your complete profile using **cosine similarity** algorithms.
	- Your profile is converted into a multi-dimensional vector representing credit score, income, spending habits, and goals.
	- Each card's requirements and benefits are also vectorized, enabling precise mathematical comparison.
	- The system calculates similarity scores (0-100%) between your profile and every card in the database.
	- Top matches are ranked and displayed with detailed explanations of why each card fits your needs.
	- Pre-approval predictions help you understand your likelihood of approval before applying.

5. **Financial Insights**
	- Users see spending breakdowns, category analysis, and actionable insights.

---

## 🧑‍💻 Local Development

### Prerequisites
- Node.js (18+ recommended)
- npm
- Python 3.10+

### Setup

1. **Clone the repository:**
	```sh
	git clone https://github.com/zavayu/hacktx.git
	cd hacktx
	```

2. **Install dependencies:**
	```sh
	cd client
	npm install
	```

3. **Configure environment variables:**
	- Copy `.env-1` to `.env` in the `client/` directory and fill in your Firebase and Gemini API keys.

4. **Run the frontend:**
	```sh
	npm run dev
	```
	The app will be available at `http://localhost:5173` (or as shown in the terminal).

5. **Run the backend:**
	```sh
	cd ../server
	pip install -r requirements.txt
	uvicorn nessie:app --reload
	```

---

## 🔒 Security & Privacy
- All sensitive user data is stored securely in Firebase Firestore.
- Authentication is handled via Firebase Auth.
- Credit card recommendations and data are for informational purposes only; always verify with issuers.

---

## 🤝 Credits
- Built by Ahmed, Matthew, Sarvesh, and Zavier for HackTX 2025
- Credit card data powered by [credit-card-db-api](https://www.npmjs.com/package/credit-card-db-api) — created and maintained by the CreditMob team
- Gemini AI integration by Google

---

## 📄 License
This project is for educational and demonstration purposes at HackTX 2025.

---

## 💡 Why CreditMob?
CreditMob makes credit simple, actionable, and fun. Whether you're just starting out or optimizing for elite rewards, CreditMob gives you the roadmap, tools, and confidence to succeed.

---

## 🏁 Get Started Today!
Sign up, take the survey, and unlock your personalized credit journey with CreditMob.