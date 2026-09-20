import bpy

bpy.ops.wm.open_mainfile(filepath="Black Widow Rigged n' Ready.blend")
for obj in bpy.data.objects:
    print(f"Name: {obj.name:25} | Type: {obj.type:10} | Parent: {str(obj.parent.name if obj.parent else 'None'):15} | Mat: {[m.name for m in obj.data.materials] if hasattr(obj.data, 'materials') else 'None'}")
