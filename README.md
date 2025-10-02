


# 🎬 Story Moodboard App

Turn your rough story ideas into structured moodboards and ready-to-use video prompts.  
Easily plan out **scenes, characters, camera angles, lighting, and pacing** for shortform content (8s, 16s, 30s).  

---

## 🚀 Features
- Free-text story input → structured moodboards  
- Scene cards (characters, camera, lighting, sound, shot list)  
- Auto-generated **final video prompt** for any text-to-video generator  
- Presets for 8s, 16s, 30s short formats  
- Save, edit, and export moodboards (JSON/PDF)  
- Copy-ready output for tools like Runway or Pika  
- Uses **Gemini API** for structured story parsing and prompt generation  
- Clean UI with Tailwind and React  

---

## 🖥 Run Locally

**Prerequisites:**  
- [Node.js](https://nodejs.org/) (LTS recommended)

**Steps:**

1. Clone this repository  
   ```bash
   git clone https://github.com/your-username/story-moodboard-app.git
   cd story-moodboard-app
````

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add your keys

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open your app at [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy

Deploy on [Vercel](https://vercel.com/) or your preferred hosting provider.

1. Push your project to GitHub
2. Connect your repo to Vercel
3. Add your `GEMINI_API_KEY` in Environment Variables
4. Deploy 🚀

---

## 🛠 Tech Stack

* **Next.js / React** — frontend & API routes
* **TailwindCSS** — styling
* **Node.js** — runtime
* **Gemini API** — AI-powered moodboard & storytelling generation
* **Optional integrations** — Runway, Pika, or any text-to-video service

---

## 📜 License

MIT License © 2025

