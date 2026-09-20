import bpy
import os

out_dir = os.path.join(os.getcwd(), "public", "models")
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. PROCESS AND EXPORT BLACK WIDOW SPIDER
# -------------------------------------------------------------
print("="*60)
print("CONFIGURING & EXPORTING BLACK WIDOW SPIDER")
print("="*60)
bpy.ops.wm.open_mainfile(filepath="Black Widow Rigged n' Ready.blend")

# Remove helper objects
delete_names = [
    'abdomen hnadle', 'foreleg_2_handle_L', 'foreleg_2_handle_R', 'foreleg_handle_L', 'foreleg_handle_R',
    'hindleg_handle_L', 'hindleg_handle_R', 'midleg_handle_L', 'midleg_handle_R',
    'pedipalp_handle_L', 'pedipalp_handle_R.', 'thorax handle', 'thorax handle.001',
    'Circle', 'Plane', 'Text', 'Camera.001'
]
for name in delete_names:
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)

# Convert materials to standard Principled BSDF
def create_principled_mat(mat_name, base_color, roughness, metallic=0.0, emission_color=None, img_name=None):
    if mat_name not in bpy.data.materials:
        mat = bpy.data.materials.new(name=mat_name)
    else:
        mat = bpy.data.materials[mat_name]
    
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    
    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['Metallic'].default_value = metallic
    
    if img_name and img_name in bpy.data.images:
        img_node = nodes.new(type='ShaderNodeTexImage')
        img_node.image = bpy.data.images[img_name]
        links.new(img_node.outputs['Color'], node_bsdf.inputs['Base Color'])
        
    return mat

create_principled_mat('chitin', (0.05, 0.05, 0.05, 1.0), roughness=0.28, metallic=0.15)
create_principled_mat('chitin abdomen', (0.04, 0.04, 0.04, 1.0), roughness=0.25, metallic=0.1, img_name='hourglass.jpg')
create_principled_mat('eyes', (0.85, 0.88, 0.95, 1.0), roughness=0.05, metallic=0.9)
create_principled_mat('fang tip', (0.15, 0.02, 0.02, 1.0), roughness=0.18, metallic=0.3)
create_principled_mat('peach fuzz', (0.08, 0.08, 0.08, 1.0), roughness=0.8, metallic=0.0)
create_principled_mat('black leg hair', (0.03, 0.03, 0.03, 1.0), roughness=0.6, metallic=0.0)

# Unpack/Pack images
bpy.ops.file.pack_all()

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
print(f"Exported clean black_widow.glb: {os.path.getsize(spider_glb)} bytes")

# -------------------------------------------------------------
# 2. PROCESS AND EXPORT SPIDERWEB WITH DEW
# -------------------------------------------------------------
print("="*60)
print("CONFIGURING & EXPORTING SPIDERWEB WITH DEW")
print("="*60)
bpy.ops.wm.open_mainfile(filepath="spiderwebWithDew.blend")

delete_web_names = ['Camera', 'Lamp', 'Sun', 'Deformer Plane']
for name in delete_web_names:
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)

# Update materials
mat_silk = create_principled_mat('Material', (0.8, 0.82, 0.85, 1.0), roughness=0.3, metallic=0.05)
mat_dew = create_principled_mat('Material.001', (0.9, 0.95, 1.0, 1.0), roughness=0.05, metallic=0.02)

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
print(f"Exported clean spiderweb_dew.glb: {os.path.getsize(web_glb)} bytes")
