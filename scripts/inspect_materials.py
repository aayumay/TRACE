import bpy

print("=== SPIDER MATERIALS & TEXTURES ===")
bpy.ops.wm.open_mainfile(filepath="Black Widow Rigged n' Ready.blend")
for mat in bpy.data.materials:
    print(f"Material: {mat.name}")
    if mat.node_tree:
        for node in mat.node_tree.nodes:
            print(f"  Node: {node.type} ({node.name})")
            if node.type == 'TEX_IMAGE' and node.image:
                print(f"    Image: {node.image.name}, filepath: {node.image.filepath}")

print("\n=== SPIDERWEB MATERIALS & TEXTURES ===")
bpy.ops.wm.open_mainfile(filepath="spiderwebWithDew.blend")
for mat in bpy.data.materials:
    print(f"Material: {mat.name}")
    if mat.node_tree:
        for node in mat.node_tree.nodes:
            print(f"  Node: {node.type} ({node.name})")
            if node.type == 'TEX_IMAGE' and node.image:
                print(f"    Image: {node.image.name}, filepath: {node.image.filepath}")
