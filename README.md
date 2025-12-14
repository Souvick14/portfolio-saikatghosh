# Portfolio - Saikat Ghosh

A dynamic, feature-rich portfolio website built with Node.js, Express, and MongoDB, showcasing videos, client work, and skills with a robust custom Admin Panel.

## 🚀 Features

*   **Dynamic Portfolio Showcase**: Display Client Work and YouTube videos with custom controls and players.
*   **Genre Management System**: Full control over project genres (Short-form & Long-form) via the Admin Panel.
    *   **Strict Filtering**: Website users can filter projects by genre (e.g., "Motion Graphics", "Commercial").
    *   **Custom Genres**: Add any custom genre dynamically when creating a project.
*   **Admin Panel**: A secure backend interface to manage:
    *   **Genres**: Add, delete, and manage filtering categories.
    *   **Client Work**: Upload projects, set technology logos, and manage details.
    *   **YouTube Videos**: targeted video management with automatic thumbnail generation.
    *   **Blogs**: Rich text editor for creating blog posts.
    *   **Skills**: Manage skills with proficiency levels.
*   **Responsive Design**: Fully responsive layout using CSS variables and modern grid/flexbox.

## 🛠️ Technology Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Frontend**: HTML5, CSS3, Vanilla JavaScript
*   **Storage**: Cloudinary (for image/logo uploads)
*   **Styling**: Custom CSS with Font Awesome icons

## 📋 Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas connection string)

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd portfolio-SaikatGhosh
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory with the following keys:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    
    # Cloudinary Configuration (Only if using image uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    
    # Admin Auth (Optional, if configured)
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=your_password
    ```

4.  **Start the Server**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

## 🖥️ Admin Panel Guide

Access the Admin Panel at: `http://localhost:3000/documentation/admin.html`

### 🏷️ Genre Management (New Feature)
The new **Genre Management System** allows you to control how projects are filtered on the main website.

*   **View Genres**: Go to the **"Genres"** tab to see all active categories.
*   **Add Genre**: Click "Add New Genre" to manually create a category.
*   **Auto-Creation**: When adding a project (Client Work or YouTube), select **"Others"** in the Genre dropdown. A text box will appear. Type your new genre name and save—it will be automatically created and saved for future use.
*   **Delete**: You can delete custom genres. Default genres (Motion Graphics, Commercial) are protected.

### 🎬 Managing Projects
1.  **Client Work (Short Form)**: Navigate to "Client Work" -> "Add Client's Work". Fill in details and select a Genre.
2.  **YouTube (Long Form)**: Navigate to "YouTube Videos" -> "Add Video". Paste the ID and select a Genre.

**Note**: If you edit a project, the Genre dropdown will now correctly show your previously saved choice.

## 📂 Project Structure

*   `server.js`: Main application entry point.
*   `/routes`: API route definitions (`client-work.js`, `youtube.js`, `genres.js`, etc.).
*   `/models`: Mongoose database schemas.
*   `/documentation`: Contains the Frontend keys:
    *   `index.html`: Main portfolio website.
    *   `admin.html`: Admin panel interface.
    *   `/assets/js`: Frontend logic (`portfolio-script.js`, `admin-script.js`, `admin-genres.js`).

## 🔌 API Endpoints

*   **GET /api/client-work**: Fetch all client projects.
*   **GET /api/youtube**: Fetch all YouTube videos.
*   **GET /api/genres**: Get list of available genres.
*   **POST /api/genres**: Create a new genre.
