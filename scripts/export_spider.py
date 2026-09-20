import bpy
import os

print("="*60)
print("INSPECTING SPIDER MODEL")
print("="*60)

for obj in bpy.data.objects:
    mod_str = ", ".join([f"{m.name} ({m.type})" for m in obj.modifiers])
    print(f"Object: {obj.name} | Type: {obj.type} | Visible: {not obj.hide_render} | Modifiers: [{mod_str}]")

# Prepare output directory
out_dir = os.path.join(os.getcwd(), "public", "models")
os.makedirs(out_dir, exist_ok=True)
spider_glb = os.path.join(out_dir, "black_widow.glb")

# Export GLB
bpy.ops.export_scene.gltf(
    filepath=spider_glb,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_animations=True,
    export_skins=True,
    export_morph=True,
)
print(f"Successfully exported spider to: {spider_glb}")
print(f"File size: {os.path.getsize(spider_glb)} bytes")
