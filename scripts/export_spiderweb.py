import bpy
import os

print("="*60)
print("INSPECTING SPIDERWEB MODEL")
print("="*60)

for obj in bpy.data.objects:
    mod_str = ", ".join([f"{m.name} ({m.type})" for m in obj.modifiers])
    print(f"Object: {obj.name} | Type: {obj.type} | Visible: {not obj.hide_render} | Modifiers: [{mod_str}]")
    if obj.type == 'MESH':
        print(f"  Mesh vertices: {len(obj.data.vertices)}, polygons: {len(obj.data.polygons)}")

# Prepare output directory
out_dir = os.path.join(os.getcwd(), "public", "models")
os.makedirs(out_dir, exist_ok=True)
web_glb = os.path.join(out_dir, "spiderweb_dew.glb")

# Export GLB
bpy.ops.export_scene.gltf(
    filepath=web_glb,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_animations=True,
    export_skins=True,
    export_morph=True,
)
print(f"Successfully exported spiderweb to: {web_glb}")
print(f"File size: {os.path.getsize(web_glb)} bytes")
