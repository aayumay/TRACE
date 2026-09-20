import bpy
import os

bpy.ops.wm.open_mainfile(filepath="spiderwebWithDew.blend")

# Delete lights, camera, deformer plane
for name in ['Camera', 'Lamp', 'Sun', 'Deformer Plane']:
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)

# Select Spiderweb and make it active
web = bpy.data.objects.get('Spiderweb')
if web:
    bpy.context.view_layer.objects.active = web
    web.select_set(True)
    
    # Make duplicates / instances real for particle systems
    try:
        bpy.ops.object.duplicates_make_real()
        print("Made particle instances real! Total objects now:", len(bpy.data.objects))
    except Exception as e:
        print("duplicates_make_real failed:", e)

# Remove the template WaterDrp if it was far away
drp = bpy.data.objects.get('WaterDrp')
if drp:
    # Check if there are other instances
    print("WaterDrp object location:", drp.location)

# Join or export
out_dir = os.path.join(os.getcwd(), "public", "models")
web_glb = os.path.join(out_dir, "spiderweb_dew.glb")

bpy.ops.export_scene.gltf(
    filepath=web_glb,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
)
print(f"Exported spiderweb_dew.glb: {os.path.getsize(web_glb)} bytes")
