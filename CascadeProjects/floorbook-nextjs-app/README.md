# Floorbook Approach - Next.js Learning Series

A modern, accessible web application built with Next.js 15, TypeScript, and ShadCN UI, showcasing the Floorbook Approach professional learning series with a custom earth-toned color palette.

## 🎨 Design System

### Color Palette
- **Primary**: Natural green (#2e7d32) - representing growth and learning
- **Secondary**: Light green (#e8f5e9) - soft, calming accent
- **Background**: Warm cream (#f8f5f0) - easy on the eyes for extended reading
- **Foreground**: Rich brown (#3e2723) - excellent readability
- **Accent**: Sage green (#c8e6c9) - subtle highlights
- **Muted**: Light beige (#f0e9e0) - secondary backgrounds

### Typography
- **Sans-serif**: Inter - clean, modern, highly readable
- **Serif**: Merriweather - elegant, perfect for educational content
- **Monospace**: Source Code Pro - for code examples and technical content

## 🚀 Features

- ✅ **Modern Stack**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- ✅ **Component Library**: ShadCN UI with custom color palette integration
- ✅ **Dark/Light Mode**: Automatic theme switching with user preference persistence
- ✅ **Responsive Design**: Mobile-first approach with professional styling
- ✅ **Accessibility**: WCAG compliant color contrasts and semantic HTML
- ✅ **Performance**: Optimized fonts, images, and build configuration

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Fonts**: [Google Fonts](https://fonts.google.com/) (Inter, Merriweather, Source Code Pro)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd floorbook-nextjs-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🌟 Component Showcase

The application demonstrates:

### UI Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, destructive)
- **Cards**: Structured content containers with headers, content, and footers
- **Forms**: Input fields, textareas, labels with proper styling
- **Typography**: Showcasing all three font families

### Educational Content
- Course overview cards
- Module breakdowns
- Learning objectives
- Resource listings
- Interactive elements

## 🎯 Educational Focus

This application is designed specifically for the **Floorbook Approach Learning Series**, which focuses on:

1. **Inquiry-Based Learning**: Moving from traditional to child-centered education
2. **Documentation**: Creating meaningful records of children's learning journeys
3. **Professional Development**: Supporting educators in transformative practices
4. **Community Building**: Fostering collaboration between educators

## 📱 Responsive Design

- **Mobile**: Optimized for smartphones with touch-friendly interactions
- **Tablet**: Enhanced layout for medium screens
- **Desktop**: Full feature set with multi-column layouts

## 🌙 Theme Support

- **Light Mode**: Warm, earthy tones perfect for daytime learning
- **Dark Mode**: Rich, comfortable colors for evening study sessions
- **System Preference**: Automatically detects user's preferred color scheme
- **Persistence**: Remembers user's theme choice across sessions

## 🚀 Deployment

The application is ready for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **GitHub Pages** (with static export)
- **Any Node.js hosting provider**

```bash
# Build and export for static hosting
npm run build
npm run export  # if configured for static export
```

## 🎨 Customization

### Updating Colors
Edit `src/app/globals.css` to modify the CSS custom properties:

```css
:root {
  --primary: #2e7d32;
  --secondary: #e8f5e9;
  /* ... other colors */
}
```

### Adding Components
Use ShadCN CLI to add more components:

```bash
npx shadcn@latest add [component-name]
```

## 📄 License

This project is part of the Floorbook Approach Learning Series educational materials.

## 🤝 Contributing

This is an educational demonstration project. For the full Floorbook Approach curriculum and professional development opportunities, please visit the official learning series.

---

**Built with ❤️ for educators who believe in the power of inquiry-based learning.**