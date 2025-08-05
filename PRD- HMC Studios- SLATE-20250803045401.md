# PRD- HMC Studios- SLATE

### Product Requirements Document: Shot List Assignment & Tracking Engine (SLATE)
**Version:** 1.1 **Date:** July 24, 2025 **Author:** Product Team **Status:** Ready for Design
### 1\. Introduction
On high-pressure, dynamic shoots like live events, concerts, and corporate functions, it is common for critical shots to be missed. Communication between the client, the project manager, and the on-site crew can be fragmented, and paper checklists are inefficient, easily lost and sometimes not even made in the first place. This leads to costly re-shoots, client dissatisfaction, and incomplete deliverables, resulting in potential churn.
This document outlines the requirements for Project **SLATE**, a web-based application designed to provide videographers and photographers with a clear, interactive, and resilient shot list on any device. The tool prioritizes speed, clarity, and reliability, ensuring that every required shot is accounted for, even in challenging on-site conditions.
### 2\. Goals and Objectives
The primary goal is to eliminate missed shots and improve the efficiency and reliability of on-site production crews.

| Objective | Key Result |
| ---| --- |
| **Increase Shot Accuracy** | Reduce the rate of missed "must-have" shots to less than 1%. |
| **Improve On-Site Efficiency** | Decrease the time a shooter spends referencing their shot list by 90% compared to paper or notes apps. |
| **Enhance Team Communication** | Provide a single source of truth for shot requirements, visible to both admins and shooters in real-time. |
| **Ensure Mission-Critical Reliability** | Achieve 100% app functionality in offline environments (no internet access). |

### 3\. User Personas & Roles
The system is designed around two primary user roles:

| Persona | Role | Needs & Goals |
| ---| ---| --- |
| **Siddhant** | **Admin** (Project/Ops Manager) | Needs to create detailed, unambiguous shot lists for his crew. Needs to assign specific responsibilities (zones) and monitor progress from a central dashboard to ensure client requirements are met. |
| **Vittal** | **Shooter** (Videographer/Photographer) | Needs an incredibly fast and simple way to see what shots are required next. Needs to know which shots are critical and confirm when they are complete, all without interrupting his creative flow. |

### 4\. User Journeys
#### 4.1 Admin User Journey (Siddhant, Proj. manager)
1. **Setup:** Siddhant logs into the web app. He navigates to the "Projects" dashboard and clicks "Create New Project."
2. **Project Creation:** He names the project "Sunburn Music Festival," sets the date, and assigns two shooters to it: **Vittal** and **Shravan**.
3. **Zone Assignment:** For Vittal, he sets his **Zone** to "Stage + Pit." For Shravan, he sets his to "GA + Sponsor Village."
4. **Checklist Creation:** Inside the project, he creates several **Checklists** to keep things organized: "Main Stage Video," "Crowd & Atmosphere Photos," and "Sponsor Activations."
5. **Item Population:** Siddhant clicks into the "Main Stage Video" checklist. He adds several **Items**:
    *   **Title:** "Wide shot of headline artist entrance."
    *   **Type:** Video
    *   **Priority:** He flags this as **"Must-Have."**
    *   **Description (optional):** "Use the 24-70mm lens. Hold for 15 seconds, capture the full stage lighting rig."
    *   **Reference Image (optional):** As an optional step for creative alignment, he has the ability to upload a photo from a previous event to show the desired framing.
6. **Monitoring:** On the day of the event, Siddhant can open the project dashboard and see a live overview of progress for both Vittal and Shravan, including which items have been checked off and any shots they've added themselves.
#### 4.2 Shooter User Journey (Vittal, the Videographer)
1. **Pre-Show:** At home, Vittal opens the app on his phone. The app has saved his credentials, and because "Sunburn Music Festival" is his only active project, it bypasses the project list and takes him directly to the project's checklist overview. The app caches all data for offline use.
2. **On-Site:** Vittal is backstage with poor cell service. He opens the app, and it loads instantly from the cache.
3. **Information at a Glance:** At the top of his screen, a persistent header reminds him: `PROJECT: Sunburn Music Festival | YOUR ZONE: Stage + Pit`.
4. **Viewing the List:** He taps on the "Main Stage Video" checklist. He sees a list of outstanding shots. Next to the "Wide shot of headline artist entrance," he sees a prominent **"Must-Have" icon** (e.g., a red exclamation mark), immediately drawing his attention to its importance.
5. **Completing a Shot:** The headliner comes on stage. Vittal gets the shot exactly as described. He pulls out his phone, finds the item, and taps the checkbox. The item animates smoothly to a "Completed" list at the bottom of the screen. The app's progress bar updates from `15/25` to `16/25`, and a timestamp is logged in the background.
6. **Capturing Opportunity:** Vittal sees an amazing, unscripted moment where the guitarist plays back-to-back with the bassist. He captures it. He then taps the "Add Shot" button, quickly types "Guitar/Bass duel closeup," and saves it. This new item appears in his list with a special icon indicating it was user-added.
7. **Syncing:** Later, he enters the media tent, which has Wi-Fi. The app detects the connection and automatically syncs all his progress, including the completed items, timestamps, and the new shot he added to the server for Siddhant to see.
### 5\. Features & Functional Requirements
#### 5.1 Core Structure
*   **Projects:** The top-level container for an event.
*   **Checklists:** Multiple, named checklists can exist within a project for organizational clarity.
*   **Items:** The individual tasks within a checklist. Completed items move to a separate, collapsed view at the bottom of the list.
#### 5.2 Item Attributes
*   **Title:** The name of the shot (required).
*   **Type:** `Photo` or `Video` (required).
*   **Description:** A text field for detailed instructions (optional).
*   **Reference Image:** An optional field for an Admin to upload a small image for visual guidance. This is a secondary feature and not part of the core workflow.
*   **Priority:** A boolean flag (`Must-Have` / `Nice-to-Have`). "Must-Have" items must be displayed with a prominent, non-intrusive visual icon.
*   **User-Added Flag:** A flag to denote if the item was created by an Admin or a Shooter.
#### 5.3 Admin Features
*   Full CRUD (Create, Read, Update, Delete) functionality for Projects, Checklists, and Items.
*   User management for assigning Shooters to Projects.
*   Ability to set a "Zone" for each Shooter on a per-project basis.
*   A dashboard to view the real-time completion progress of all assigned Shooters.
#### 5.4 Shooter Features
*   Read-only view of Admin-created checklists.
*   Ability to check/uncheck items.
*   Ability to **add** new items to their own list, but not edit or delete Admin-created items.
*   A persistent, visible header showing the current Project and their assigned Zone.
*   A clear progress bar and counter (e.g., "16 / 25 Completed").
*   The app must remember the last-viewed project and open it by default on subsequent visits.
#### 5.5 Key Technical Requirements
*   **Progressive Web App (PWA):** The application must be built to be fully functional offline. It must cache all necessary data and sync automatically when an internet connection becomes available.
*   **Authentication:** Secure user login (e.g., Google/email-based).
*   **Responsive Design:** The UI must be optimized for fast, one-handed use on mobile devices but also be functional on tablets and desktops.
*   **Real-time Database:** A backend like Firestore is required to sync data between users in real-time.
*   **Automatic Timestamping:** The system must automatically record the timestamp when an item's state is changed to "complete."
### 6\. Assumptions and Dependencies
*   **Assumption:** Users will have a modern web browser on their device capable of supporting PWA functionality.
*   **Dependency:** The application relies on a third-party service for user authentication.
*   **Dependency:** The real-time sync and admin dashboard features are dependent on a stable internet connection _for the admin_. The shooter's experience is architected to be connection-independent.