# THREADLAB — 3D T-Shirt Studio

A browser-based 3D T-shirt customizer built with Three.js.

## Features
- Interactive 3D garment preview with orbit, pan and zoom controls
- Front and back views
- Six fabric colorways
- Upload PNG, JPG or WEBP artwork (up to 10 MB)
- Artwork placement and scale controls
- Real-time studio lighting, shadows and a procedural fabric texture
- Export a PNG snapshot of the current 3D preview
- Responsive desktop and mobile layout

## Run locally
Because this project uses JavaScript modules, serve the folder with a local web server:

```bash
npx serve .
```

Then open the local URL printed by the server.

## Deploy
The site is static and can be hosted on GitHub Pages:
1. Open repository **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select **main** and **/(root)**, then save.

The first version uses a procedural Three.js garment mesh. For a true Blender-quality cloth asset, export a detailed model from Blender as GLB and replace the procedural garment in `app.js`.

## Controls
- Left-drag: rotate the garment view
- Right-drag: pan
- Mouse wheel: zoom
- Front / Back: switch garment view
- Reset: restore the camera
