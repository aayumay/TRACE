import bpy

bpy.ops.wm.open_mainfile(filepath="Black Widow Rigged n' Ready.blend")
# Check bounds of spider mesh objects
min_co = [999999]*3
max_co = [-999999]*3
for obj in bpy.data.objects:
    if obj.type == 'MESH' and not any(h in obj.name for h in ['handle', 'Plane', 'Text', 'Circle']):
        for v in obj.bound_box:
            world_v = obj.matrix_world @ bpy.mathutils.Vector(v)
            for i in range(3):
                min_co[i] = min(min_co[i], world_v[i])
                max_co[i] = max(max_co[i], world_v[i])

print("Spider Bounds: Min:", min_co, "Max:", max_co)
print("Spider Dimensions (X, Y, Z):", [max_co[i] - min_co[i] for i in range(3)])

bpy.ops.wm.open_mainfile(filepath="spiderwebWithDew.blend")
obj = bpy.data.objects.get("Spiderweb")
if obj:
    print("Spiderweb Dimensions (X, Y, Z):", obj.dimensions)
