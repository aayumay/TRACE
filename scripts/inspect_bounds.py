import bpy

def inspect_blend(blend_path):
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    print("="*60)
    print("INSPECTING:", blend_path)
    for obj in bpy.data.objects:
        print(f"Object: {obj.name}, Type: {obj.type}, Location: {obj.location}, Dimensions: {obj.dimensions}")

inspect_blend("Black Widow Rigged n' Ready.blend")
inspect_blend("spiderwebWithDew.blend")
