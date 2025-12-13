# Genre Dropdown HTML - Manual Insertion Guide

## CLIENT WORK FORM (Short Form Project)

**Location:** After the Revenue/Budget field, before "Video Preview"  
**File:** `admin.html`  
**Line:** Around line 706-708

**Insert this HTML:**

```html
<!-- Genre Selection -->
<div class="form-group">
    <label for="clientWorkGenre">Genre *</label>
    <select id="clientWorkGenre" required class="inputstyler">
        <option value="">Select Genre</option>
        <option value="Motion Graphics">Motion Graphics</option>
        <option value="Commercial">Commercial</option>
        <option value="Others">Others</option>
    </select>
</div>

<div class="form-group" id="clientWorkCustomGenreGroup" style="display: none;">
    <label for="clientWorkCustomGenre">Custom Genre *</label>
    <input type="text" id="clientWorkCustomGenre" class="inputstyler"
           placeholder="Enter custom genre (e.g., Tutorial, Documentary)">
    <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">
        This genre will be saved for future use
    </small>
</div>
```

---

## YOUTUBE FORM (Long Form Project)

**Location:** After Description field, before Category/Order field  
**File:** `admin.html`  
**Line:** Search for "YouTube Videos Section" in admin.html

**Insert this HTML:**

```html
<!-- Genre Selection -->
<div class="form-group">
    <label for="youtubeGenre">Genre *</label>
    <select id="youtubeGenre" required class="inputstyler">
        <option value="">Select Genre</option>
        <option value="Motion Graphics">Motion Graphics</option>
        <option value="Commercial">Commercial</option>
        <option value="Others">Others</option>
    </select>
</div>

<div class="form-group" id="youtubeCustomGenreGroup" style="display: none;">
    <label for="youtubeCustomGenre">Custom Genre *</label>
    <input type="text" id="youtubeCustomGenre" class="inputstyler"
           placeholder="Enter custom genre (e.g., Tutorial, Documentary)">
    <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">
        This genre will be saved for future use
    </small>
</div>
```

---

## VERIFICATION

After adding, you should see:
1. "Genre *" dropdown with 3 options
2. When you select "Others", a text input appears below
3. The genre JavaScript (`admin-genres.js`) will handle the rest automatically

## FILES ALREADY CREATED
- ✅ `admin-genres.js` - Handles dropdown logic
- ✅ `routes/genres.js` - API backend
- ✅ `models/Genre.js` - Database model  
- ✅ Genre fields added to ClientWork and YouTubeVideo models

**Only missing:** The HTML form fields in admin.html
