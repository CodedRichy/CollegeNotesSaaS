# CollegeNotesSaaS

## Overview
**CollegeNotesSaaS** is a centralized study material platform built for KTU (Kerala Technological University) S4 students. It provides a dedicated, accessible repository for students to upload, organize, and view Database Management Systems (DBMS) notes exactly as they align with the university syllabus.

## The Problem
During exam preparation, students consistently struggle with disorganized study materials. Notes are often scattered across various WhatsApp groups, lost in Google Drive links, or fragmented between different students. This project eliminates that friction by providing a single, reliable source of truth for module-specific learning resources.

## Core Features
- **PDF Upload Portal:** A streamlined interface allowing anyone to easily upload their study materials.
- **Module-Centric Organization:** Automatic sorting and storage of PDFs into KTU Modules 1 through 4, reflecting the actual KTU exam syllabus structure.
- **Instant Viewing:** Direct, publicly accessible links to view documents quickly from the browser without downloading constraints or file format mismatches.
- **Cloud Storage Integration:** Scalable, reliable file handling powered by Supabase.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Library:** React
- **Styling:** Tailwind CSS
- **Database / Storage:** Supabase

## Architecture
The application runs as a modern Next.js serverless frontend. Form handling and UI states are managed via React Server Components and generic client components. File persistence skips traditional intermediate API layers by securely communicating directly from the client to a configured Supabase Storage Bucket (`notes`). Directory structures within the bucket dynamically act as categories for KTU modules holding the files. 

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/CollegeNotesSaaS.git
   cd CollegeNotesSaaS/college-notes-saas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the Next.js root and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   *Navigate to `http://localhost:3000` to view the application.*

## Roadmap
While the current implementation focuses intensely on reliable storage infrastructure and exam-oriented UI foundations, future technical expansions include:
- **Authentication & Authorization:** Secure student sign-ins and upload attributions.
- **AI-Powered Semantic Search:** Query-based search logic to find specific topics within uploaded PDFs.
- **Exam-Mode Q&A Generation:** Automated extraction of core DBMS concepts to synthesize exam-ready flashcards and summaries.
