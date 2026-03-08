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
