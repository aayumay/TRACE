import bpy
import os

bpy.ops.wm.open_mainfile(filepath="spiderwebWithDew.blend")

for name in ['Camera', 'Lamp', 'Sun', 'Deformer Plane']:
    if name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)

drp = bpy.data.objects.get('WaterDrp')
if drp:
    bpy.context.view_layer.objects.active = drp
    mod = drp.modifiers.new(name='Decimate', type='DECIMATE')
    mod.ratio = 0.2
    bpy.ops.object.modifier_apply(modifier=mod.name)

web = bpy.data.objects.get('Spiderweb')
if web:
    bpy.context.view_layer.objects.active = web
    web.select_set(True)
    bpy.ops.object.duplicates_make_real()

if drp:
    bpy.data.objects.remove(drp, do_unlink=True)

dew_objects = [o for o in bpy.data.objects if o != web and o.type == 'MESH']
if dew_objects:
    bpy.ops.object.select_all(action='DESELECT')
    for o in dew_objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = dew_objects[0]
    bpy.ops.object.join()
    dew_mesh = bpy.context.active_object
    dew_mesh.name = "DewDrops"

def create_principled_mat(mat_name, base_color, roughness, metallic=0.0):
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
    return mat

mat_silk = create_principled_mat('Material', (0.88, 0.9, 0.95, 1.0), roughness=0.3, metallic=0.1)
mat_dew = create_principled_mat('Material.001', (0.95, 0.98, 1.0, 1.0), roughness=0.02, metallic=0.05)

out_dir = os.path.join(os.getcwd(), "public", "models")
web_glb = os.path.join(out_dir, "spiderweb_dew.glb")

bpy.ops.export_scene.gltf(
    filepath=web_glb,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
)
print(f"Exported standard spiderweb_dew.glb: {os.path.getsize(web_glb)} bytes")
