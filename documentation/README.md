# Dynamic Influencer Portfolio

A modern, responsive portfolio website for content creators with dynamic content loading from YouTube and Google Drive APIs.

## Features

- 🔄 **Loading Animations** - Smooth loading screen with rotating text
- 📱 **Auto-Loop Carousels** - Showcase Reels, Blogs, and Commercial work
- 🎬 **YouTube Integration** - Direct video embedding with iframe support
- 📁 **Google Drive API** - Automatic blog image loading
- 💾 **Data Management** - localStorage-based content management
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **No Framework Dependencies** - Pure HTML, CSS, JavaScript

## Live Demo

Open `index.html` in your browser to see the portfolio in action.

## Setup

### Basic Setup (Works Immediately)

1. Clone the repository
2. Open `index.html` in a web browser
3. Portfolio works with mock data out of the box!

### API Integration (Optional)

To use real YouTube and Google Drive content:

1. **Get API Keys:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select existing
   - Enable YouTube Data API v3 and Google Drive API
   - Create credentials (API Key)

2. **Configure APIs:**
   - Edit `assets/js/config.js`
   - Add your YouTube API key and Channel ID
   - Add your Google Drive API key and Folder ID

3. **Update Content:**
   - Edit `assets/js/data-manager.js`
   - Replace mock video IDs with your YouTube video IDs
   - Update blog posts with your content

## File Structure

```
├── index.html                    # Main portfolio page
├── assets/
│   ├── css/
│   │   ├── portfolio-style.css  # Main styles
│   │   └── carousel.css         # Carousel component
│   ├── js/
│   │   ├── config.js            # API configuration
│   │   ├── data-manager.js      # Data management
│   │   ├── api-handler.js       # API integration
│   │   └── portfolio-script.js  # Main functionality
│   ├── images/
│   │   └── portfolio/           # Project images
│   └── fonts/
│       └── ElegantIcons.*       # Icon fonts
```

## Customization

### Change Colors

Edit `assets/css/portfolio-style.css`:

```css
:root {
    --primary-purple: #8b5cf6;
    --primary-blue: #3b82f6;
    --primary-cyan: #06b6d4;
}
```

### Adjust Carousel Speed

Edit `assets/js/config.js`:

```javascript
carousel: {
    intervalDuration: 5000  // milliseconds
}
```

### Update Loading Text

Edit `index.html` (loading screen section):

```html
<div class="loader-text">Your Custom Text</div>
```

## Technologies

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- YouTube API
- Google Drive API
- Font Awesome 6.4.0

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Features in Detail

### Reels Section
- YouTube shorts/reels carousel
- Auto-play with 5-second intervals
- Swipe gesture support
- View counts from YouTube API

### Blogs Section
- Blog post carousel
- Featured images from Google Drive
- Excerpt previews
- Read more links

### Commercial Section
- Brand collaboration showcase
- YouTube video embeds
- Performance statistics
- Revenue tracking

## Contributing

Feel free to fork this project and customize it for your needs!

## License

MIT License - feel free to use for personal or commercial projects.

## Author

Created with ❤️ and creativity

---

**Note:** This portfolio uses mock data by default. Add your API keys to `config.js` to load real content from YouTube and Google Drive.
