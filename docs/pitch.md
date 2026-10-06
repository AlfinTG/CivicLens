# CivicLens - AI-Powered Public Infrastructure Monitoring

## 1. Problem
Potholes, broken streetlights, and overflowing drains often go unreported for weeks. Citizens find reporting cumbersome, and municipal departments struggle to prioritize and route issues correctly based on vague complaints.

## 2. Solution: CivicLens
CivicLens fixes that. It's a simple, AI-powered public infrastructure monitoring system.
- **For Citizens:** Snap a photo and you're done. No long forms.
- **For Municipalities:** Vision AI automatically detects the issue type, scores severity (1-5), and assigns it to the correct department with exact GPS coordinates.

## 3. Demo (2 minutes)
1. **The Hook:** "Potholes and broken lights go unreported for weeks. CivicLens fixes that."
2. **Citizen Experience:** Open the report page on a phone. Snap a pothole photo.
3. **AI Magic:** Show how the AI result appears instantly: identifying the type, severity, and responsible department without user input.
4. **Operations Dashboard:** Switch to the admin dashboard. Show the new red pin appearing on the map in real-time.
5. **Taking Action:** Show the priority table. Explain how priority is calculated (severity + age + duplicate reports). Mark one issue as "In progress."
6. **Closing & Future Scope:** Close with the vision for the future: WhatsApp reporting integration, auto-emailing municipal bodies, and predicting repair times.

## 4. Tech Stack
- **AI:** Vision LLM for image analysis
- **Backend:** FastAPI, SQLite, Python
- **Frontend:** React, Vite, Tailwind CSS, Leaflet

## 5. Team
- Built during Hactoberfest '26
