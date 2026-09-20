import bpy
import os

bpy.ops.wm.open_mainfile(filepath="Black Widow Rigged n' Ready.blend")
for img in bpy.data.images:
    print(f"Image: {img.name}, size: {img.size}, has_data: {img.has_data}, packed: {img.packed_file is not None}")
    if img.packed_file:
        save_path = os.path.join(os.getcwd(), "public", "models", img.name)
        img.save_render(save_path)
        print(f"Saved image to: {save_path}")
