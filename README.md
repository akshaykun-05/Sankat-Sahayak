# Sankat Sahayak

Sankat Sahayak is a comprehensive emergency reporting and assistance web application designed specifically for the Indian context. It empowers users to quickly request help, generate formal police complaints (First Information Reports - FIRs), and access vital emergency contacts seamlessly.

## Features

*   **SOS Trigger:** A prominent panic button that instantly alerts emergency services and local authorities with the user's verified location and timestamp.
*   **AI-Powered FIR & Application Generator:** 
    *   Generates formal legal documents (FIRs and Police Applications) in both English and Hindi.
    *   Powered by Groq (LLaMA 3.1 8B Instant) for accurate legal formatting.
*   **Intelligent Incident Journal:**
    *   Write descriptions, use voice dictation, or upload media (images/video).
    *   **Image Analysis:** Integrates Google Gemini (1.5 Flash) to describe accident or crime scenes in detail.
    *   **OCR Capabilities:** Uses Tesseract.js to automatically detect and extract Indian vehicle registration numbers from uploaded evidence.
    *   **Secure Evidence Storage:** Uploads media securely to AWS S3.
*   **Emergency Directory:** One-tap access to central emergency responders:
    *   Police Control Room (100)
    *   Medical Emergency / Ambulance (108)
    *   Fire Rescue (101)
    *   Women Helpline (1091)
*   **Case History:** A secure archive where users can review their generated incident reports.
*   **Medical ID Profile:** Stores critical user information like Blood Group and Allergies for first responders.
*   **Bilingual Support:** Full UI and output support for English and Hindi.
*   **Responsive UI:** A modern, glass-morphism inspired interface styled with Tailwind CSS, supporting dark mode.

## Tech Stack

**Frontend:**
*   HTML5
*   Tailwind CSS (via CDN)
*   JavaScript (Vanilla)
*   jsPDF (for client-side PDF generation)

**Backend:**
*   Node.js
*   Express.js
*   Groq SDK
*   Google Generative AI SDK
*   Tesseract.js (OCR)
*   AWS SDK (S3)

## Setup & Installation

1.  **Clone the repository or download the source code.**
2.  **Navigate to the project directory:**
    ```bash
    cd "Sankat sahayak"
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Environment Variables:**
    Create a `.env` file in the root directory and configure the following keys:
    ```env
    PORT=3000
    GROQ_API_KEY=your_groq_api_key_here
    GEMINI_API_KEY=your_gemini_api_key_here
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_REGION=your_aws_region
    S3_BUCKET_NAME=your_s3_bucket_name
    ```
    *(Note: Gemini and AWS S3 keys are optional but required for image analysis and cloud media storage, respectively).*
5.  **Start the server:**
    ```bash
    npm run dev
    # or
    npm start
    ```
6.  **Access the application:**
    Open `index.html` in your browser or run a live server on the frontend files.

## API Endpoints

*   `GET /test` - Health check route.
*   `POST /trigger-sos` - Receives latitude, longitude, and timestamp to log emergency requests.
*   `POST /generate-fir` - Accepts incident descriptions and base64 images to generate structured English and Hindi FIRs or police applications.

## License
ISC
