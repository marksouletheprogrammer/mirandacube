# 3D Cube Menu

A GameCube-inspired 3D cube menu with a birthday photo grid feature.

---

## Updating Birthday Photos

Photos live in the `birthday/` folder. They appear in the 3×3 grid in **alphabetical order** (top-left to bottom-right). Only the first 9 photos are displayed.

### Steps

1. Add, remove, or rename image files in the `birthday/` folder
   - Supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
   - Files are sorted alphabetically, so name them accordingly (e.g. `a.png`, `b.png`, etc.)

2. Run the build script:
   ```
   ./build-photos.sh
   ```

3. Open `index.html` in a browser to verify

### What the build script does

It scans `birthday/` for image files, sorts them alphabetically, and updates the `photos` array in `script.js`. That's it.

### Example

```
$ cp ~/new-photo.jpg birthday/i.jpg
$ ./build-photos.sh
Found 9 photo(s) in birthday/:
  a.png
  b.png
  ...
  i.jpg

Updated script.js with: const photos = ['a.png', 'b.png', ..., 'i.jpg'];
```

---
 
## Hosting on Cloudflare Pages
 
This project works well as a **static site** on **Cloudflare Pages**.
 
### Recommended setup
 
- Push this project to a GitHub repo
- Connect the repo to **Cloudflare Pages**
- Deploy from the `main` branch
- No build command
- No output directory
- Add your custom domain in Cloudflare Pages after the first deploy
 
### Cloudflare Pages settings
 
- **Production branch:** `main`
- **Framework preset:** None
- **Build command:** leave blank
- **Build output directory:** leave blank
 
### Deployment steps
 
1. Push the repo to GitHub
2. In Cloudflare, go to **Workers & Pages**
3. Create a new **Pages** project
4. Connect your GitHub repo
5. Select the `main` branch
6. Leave build settings empty
7. Deploy
 
After deploy, Cloudflare will give you a `*.pages.dev` URL.
 
### Custom domain
 
After the site is live:
 
1. Buy a domain name
2. In Cloudflare Pages, open the project
3. Go to **Custom domains**
4. Add your domain
5. Follow the DNS prompts
 
If the domain is also managed in Cloudflare, setup is usually very simple.
 
### Updating photos after the site is live
 
When you add or remove photos:
 
1. Update files in `birthday/`
2. Run:
   ```bash
   ./build-photos.sh
   ```
Commit and push to main
Cloudflare Pages will automatically redeploy the site.

Example update workflow
```
bash
./build-photos.sh
git add .
git commit -m "Update birthday photos"
git push
```