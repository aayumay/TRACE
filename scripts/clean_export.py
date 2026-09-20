import bpy
import os

out_dir = os.path.join(os.getcwd(), "public", "models")
os.makedirs(out_dir, exist_ok=True)

# 1. CLEAN EXPORT SPIDER
print("="*60)
print("CLEANING & EXPORTING SPIDER")
print("="*60)
bpy.ops.wm.open_mainfile(filepath="Black Widow Rigged n' Ready.blend")

# Remove non-spider objects
exclude_prefixes = ['abdomen hnadle', 'foreleg', 'hindleg', 'midleg', 'pedipalp_handle', 'thorax handle', 'Circle', 'Plane', 'Text', 'Camera']
# But wait! 'Circle.000'..'Circle.011' are legs and fangs!
# Let's check which objects to DELETE:
delete_names = [
    'abdomen hnadle', 'foreleg_2_handle_L', 'foreleg_2_handle_R', 'foreleg_handle_L', 'foreleg_handle_R',
    'hindleg_handle_L', 'hindleg_handle_R', 'midleg_handle_L', 'midleg_handle_R',
    'pedipalp_handle_L', 'pedipalp_handle_R.', 'thorax handle', 'thorax handle.001',
    'Circle', # Floor circle
    'Plane',  # Floor plane
    'Text',   # Instructions text
    'Camera.001'
]

for name in delete_names:
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)

# Unpack all packed images (like hourglass.jpg) into memory so glTF can embed them
bpy.ops.file.pack_all()

# Set up Principled BSDF on materials if needed so glTF exports beautifully
for mat in bpy.data.materials:
    mat.use_nodes = True
    print("Exporting material:", mat.name)

spider_glb = os.path.join(out_dir, "black_widow.glb")
bpy.ops.export_scene.gltf(
    filepath=spider_glb,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_animations=True,
    export_skins=True,
    export_morph=True,
)
print(f"Spider GLB exported: {spider_glb}, size: {os.path.getsize(spider_glb)} bytes")

# 2. CLEAN EXPORT SPIDERWEB
print("="*60)
print("CLEANING & EXPORTING SPIDERWEB")
print("="*60)
bpy.ops.wm.open_mainfile(filepath="spiderwebWithDew.blend")

# Remove camera and lights, deformer plane
delete_web_names = ['Camera', 'Lamp', 'Sun', 'Deformer Plane']
for name in delete_web_names:
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)

web_glb = os.path.join(out_dir, "spiderweb_dew.glb")
bpy.ops.export_scene.gltf(
    filepath=web_glb,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_animations=True,
    export_skins=True,
    export_morph=True,
)
print(f"Spiderweb GLB exported: {web_glb}, size: {os.path.getsize(web_glb)} bytes")
