# Year in Pixels - Track Your Life, One Day at a Time

**Year in Pixels** is a web application designed to help you reflect on and visualize your daily life through moods, events, and journaling. Inspired by the traditional bullet journal concept, this digital version provides a simple yet powerful way to track your well-being and memories throughout the year.

Built with modern web technologies, it offers a clean, responsive interface accessible from any device.

## ✨ Features

*   **🎨 Daily Pixel Tracking:** Log your day quickly by assigning it a "pixel".
*   **😊 Mood Logging:** Associate one or more moods (e.g., Happy, Sad, Tired, Productive, Relaxed) with each day. Customize your moods with distinct names and colors.
*   **🗓️ Event Tagging:** Add custom events or activities that happened during the day (e.g., "Visited museum", "Finished project", "Movie night").
*   **✍️ Daily Journaling:** Expand on your day with a rich text journal entry using a powerful WYSIWYG editor (powered by Tiptap). Format text, add lists, links, and more to capture your thoughts and experiences.
*   **📊 Dashboard Overview:** Get a quick glance at your recent entries and activity on your personal dashboard.
*   **🟩 Classic Grid View:** Visualize your entire year at a glance with the iconic "Year in Pixels" grid. Each square represents a day, colored according to the mood(s) you logged. Click on colors to filter and see patterns!
*   **📅 Calendar View:** Navigate your pixels through a familiar calendar interface, making it easy to jump to specific dates or view months.
*   **🔐 Secure Authentication:** Protect your personal data with secure email/password login and optional social logins (e.g., Google) powered by NextAuth.js.
*   **⚙️ Customization:** Manage your own lists of moods (with colors!) and frequently used events for faster logging.

## 🚀 Tech Stack

This project leverages a modern, full-stack TypeScript setup:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** [SQLite](https://www.sqlite.org/index.html) (Ideal for easy setup and development)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
*   **Rich Text Editor:** [Tiptap](https://tiptap.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## ⚙️ Getting Started (Development)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/year-in-pixels.git # Replace with your repo URL
    cd year-in-pixels
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install or pnpm install
    ```

3.  **Set up environment variables:**
    *   Copy the `.env.example` file to `.env`.
    *   Fill in the required variables:
        *   `DATABASE_URL="file:./dev.db"` (Default for SQLite)
        *   `NEXTAUTH_URL=http://localhost:3000` (Adjust port if needed)
        *   `NEXTAUTH_SECRET=` (Generate a strong secret using `openssl rand -base64 32`)
        *   `GOOGLE_CLIENT_ID=` (If using Google OAuth)
        *   `GOOGLE_CLIENT_SECRET=` (If using Google OAuth)
        *   *(Add any other variables required by your setup)*

4.  **Initialize the database:**
    *   Run Prisma migrations to create the database schema:
        ```bash
        npx prisma migrate dev --name init
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    # or yarn dev or pnpm dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 License

<!-- Choose a license, e.g., MIT -->
This project is licensed under the [MIT License](LICENSE.md).

---

Happy Pixel Tracking! ✨