"""Render RakshaOne's three-frame movement studies in Blender Grease Pencil.

Run in a connected Blender session. A separate scene is created; the user's
existing scene and objects are not removed. Output is static WebP, not runtime
Blender code in the web app.
"""

from pathlib import Path
from math import cos, sin, pi, hypot
import bpy
from mathutils import Vector

OUT = Path(r"D:\Rishit\Main Code\RakshaOne\assets\motion")
OUT.mkdir(parents=True, exist_ok=True)
SCENE_NAME = "RakshaOne movement studies"
if SCENE_NAME in bpy.data.scenes:
    bpy.data.scenes.remove(bpy.data.scenes[SCENE_NAME])
for collection, prefix in (
    (bpy.data.objects, "RakshaOne "),
    (bpy.data.grease_pencils, "RakshaOne character drawings"),
    (bpy.data.cameras, "RakshaOne camera lens"),
    (bpy.data.lights, "RakshaOne guide light"),
    (bpy.data.materials, "RakshaOne "),
):
    for item in list(collection):
        if item.name.startswith(prefix) and item.users == 0:
            collection.remove(item)
scene = bpy.data.scenes.new(SCENE_NAME)
bpy.context.window.scene = scene
scene.render.engine = bpy.data.scenes["Scene"].render.engine if "Scene" in bpy.data.scenes else scene.render.engine
scene.render.resolution_x = 430
scene.render.resolution_y = 370
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.quality = 88
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
scene.render.use_file_extension = True
scene.camera = bpy.data.objects.new("RakshaOne orthographic camera", bpy.data.cameras.new("RakshaOne camera lens"))
scene.collection.objects.link(scene.camera)
scene.camera.location = (0, -10, 1.05)
scene.camera.rotation_euler = (pi / 2, 0, 0)
scene.camera.data.type = "ORTHO"
scene.camera.data.ortho_scale = 2.65
light_data = bpy.data.lights.new("RakshaOne guide light", "AREA")
light_data.energy = 900
light_data.shape = "DISK"
light_data.size = 5
light = bpy.data.objects.new("RakshaOne guide light", light_data)
scene.collection.objects.link(light)
light.location = (0, -3, 5)
light.rotation_euler = (Vector((0, 0, 1))-light.location).to_track_quat("-Z", "Y").to_euler()

gp = bpy.data.grease_pencils.new("RakshaOne character drawings")
character = bpy.data.objects.new("RakshaOne training character", gp)
scene.collection.objects.link(character)
layer = gp.layers.new("Movement keyframes", set_active=True)

def material(name, stroke_color, fill_color=None):
    mat = bpy.data.materials.new("RakshaOne " + name)
    bpy.data.materials.create_gpencil_data(mat)
    mat.use_nodes = False
    mat.diffuse_color = fill_color or stroke_color
    mat.grease_pencil.color = stroke_color
    mat.grease_pencil.show_fill = fill_color is not None
    if fill_color is not None:
        mat.grease_pencil.fill_color = fill_color
    gp.materials.append(mat)
    return len(gp.materials) - 1

INK = material("ink", (.04, .025, .02, 1))
CORAL = material("coral", (.20, .035, .025, 1), (.48, .13, .085, 1))
PEACH = material("skin", (.29, .09, .065, 1), (.86, .44, .31, 1))
PANTS = material("pants", (.06, .07, .07, 1), (.15, .17, .18, 1))
SHOE = material("shoes", (.04, .025, .02, 1), (.10, .07, .05, 1))
GUIDE = material("guide", (.45, .12, .075, .72))

def stroke(drawing, points, mat, width=.018, closed=False):
    drawing.add_strokes([len(points)])
    item = drawing.strokes[-1]
    item.material_index = mat
    item.cyclic = closed
    item.fill_color = (1, 1, 1, 0)
    for point, (x, z) in zip(item.points, points):
        point.position = (x, 0, z)
        point.radius = width
        point.vertex_color = (1, 1, 1, 0)

def ellipse(drawing, cx, cz, rx, rz, mat, width=.018):
    stroke(drawing, [(cx + rx*cos(i*2*pi/28), cz + rz*sin(i*2*pi/28)) for i in range(28)], mat, width, True)

def limb(drawing, a, b, thickness, mat):
    dx, dz = b[0]-a[0], b[1]-a[1]
    size = max(hypot(dx, dz), .001)
    nx, nz = -dz/size*thickness/2, dx/size*thickness/2
    stroke(drawing, [(a[0]+nx,a[1]+nz),(b[0]+nx,b[1]+nz),(b[0]-nx,b[1]-nz),(a[0]-nx,a[1]-nz)], mat, .008, True)

def arrow(drawing, start, end):
    stroke(drawing, [start, end], GUIDE, .024)
    dx, dz = end[0]-start[0], end[1]-start[1]
    length = max(hypot(dx, dz), .001)
    ux, uz = dx/length, dz/length
    wing = (-uz, ux)
    stroke(drawing, [(end[0]-ux*.18+wing[0]*.11,end[1]-uz*.18+wing[1]*.11),end,(end[0]-ux*.18-wing[0]*.11,end[1]-uz*.18-wing[1]*.11)], GUIDE, .024)

def draw_person(drawing, pose):
    scale = pose.get("scale", 1)
    shift = pose.get("shift", 0)
    floor = pose.get("floor", 0)
    yaw = pose.get("yaw", 0)
    width = 1-.38*yaw
    hands = pose.get("hands", "down")
    leg = pose.get("leg", "base")
    def xy(x, z):
        return (shift+x*scale, floor+z*scale)
    left_shoulder, right_shoulder = xy(-.32*width,1.55), xy(.32*width,1.55)
    left_hip, right_hip = xy(-.20*width,.94), xy(.20*width,.94)
    if leg == "lead":
        left_knee, right_knee = xy(-.25,.55), xy(.46,.58)
        left_ankle, right_ankle = xy(-.28,.10), xy(.68,.13)
    elif leg == "follow":
        left_knee, right_knee = xy(.20,.54), xy(.59,.57)
        left_ankle, right_ankle = xy(.18,.10), xy(.67,.12)
    elif leg == "rear":
        left_knee, right_knee = xy(-.30,.55), xy(.22,.58)
        left_ankle, right_ankle = xy(-.36,.11), xy(.26,.20)
    else:
        left_knee, right_knee = xy(-.23,.55), xy(.23,.55)
        left_ankle, right_ankle = xy(-.28,.10), xy(.28,.10)
    # Back limbs first. The shoulder and hip anchors keep the anatomy coherent.
    for hip, knee, ankle in ((left_hip,left_knee,left_ankle),(right_hip,right_knee,right_ankle)):
        limb(drawing, hip, knee, .21*scale, PANTS)
        limb(drawing, knee, ankle, .16*scale, PANTS)
        limb(drawing, xy((ankle[0]-shift)/scale-.08,(ankle[1]-floor)/scale-.02), xy((ankle[0]-shift)/scale+.12,(ankle[1]-floor)/scale-.02), .10*scale, SHOE)
    stroke(drawing, [left_shoulder,right_shoulder,xy(.27*width,1.04),right_hip,left_hip,xy(-.27*width,1.04)], CORAL, .018, True)
    # Neck and head have a continuous outline instead of separate stick joints.
    limb(drawing,xy(-.07,1.6),xy(.07,1.79),.14*scale,PEACH)
    ellipse(drawing,*xy(0,1.94),.23*scale,.27*scale,PEACH)
    if hands == "cover":
        left_elbow,right_elbow=xy(-.51,1.27),xy(.51,1.27)
        left_wrist,right_wrist=xy(-.23,1.91),xy(.23,1.91)
    elif hands == "guard":
        left_elbow,right_elbow=xy(-.48,1.24),xy(.48,1.24)
        left_wrist,right_wrist=xy(-.36,1.50),xy(.36,1.50)
    else:
        left_elbow,right_elbow=xy(-.43,1.18),xy(.43,1.18)
        left_wrist,right_wrist=xy(-.45,.91),xy(.45,.91)
    for shoulder, elbow, wrist in ((left_shoulder,left_elbow,left_wrist),(right_shoulder,right_elbow,right_wrist)):
        limb(drawing,shoulder,elbow,.17*scale,CORAL)
        limb(drawing,elbow,wrist,.13*scale,PEACH)
        ellipse(drawing,wrist[0],wrist[1],.095*scale,.11*scale,PEACH)
        if hands != "down":
            for offset in (-.065,-.022,.022,.065):
                stroke(drawing,[(wrist[0]+offset*scale,wrist[1]+.07*scale),
                                (wrist[0]+offset*scale,wrist[1]+.16*scale)],PEACH,.010)
    # A small face direction cue makes the turn study legible.
    if yaw:
        stroke(drawing,[xy(.06,1.97),xy(.14,1.95)],INK,.018)
    else:
        stroke(drawing,[xy(-.09,1.98),xy(-.045,1.98)],INK,.014)
        stroke(drawing,[xy(.045,1.98),xy(.09,1.98)],INK,.014)

def pose_for(mode, stage):
    if mode == "ready_stance": return [dict(leg="base"),dict(leg="lead"),dict(leg="base")][stage]
    if mode == "open_guard": return [dict(),dict(hands="guard"),dict(hands="guard")][stage]
    if mode == "head_cover": return [dict(),dict(hands="cover"),dict(hands="cover")][stage]
    if mode == "side_step": return [dict(),dict(leg="lead",shift=.08),dict(leg="follow",shift=.30)][stage]
    if mode == "guard_step": return [dict(hands="guard"),dict(hands="guard",leg="lead",shift=.08),dict(hands="guard",leg="follow",shift=.30)][stage]
    if mode == "boundary_raise": return [dict(),dict(hands="guard"),dict(hands="guard",leg="follow",shift=.30)][stage]
    if mode == "retreat_step": return [dict(),dict(leg="rear",scale=.94,floor=.04),dict(scale=.87,floor=.12)][stage]
    if mode == "exit_turn": return [dict(),dict(yaw=.72),dict(yaw=.72,leg="follow",shift=.30)][stage]
    if mode == "cover_raise": return [dict(),dict(hands="cover"),dict(hands="cover",leg="follow",shift=.30)][stage]
    raise ValueError(mode)

modes = ("ready_stance","open_guard","head_cover","side_step","guard_step", "boundary_raise","retreat_step","exit_turn","cover_raise")
for mode_index, mode in enumerate(modes):
    for stage in range(3):
        frame_number = mode_index*3 + stage + 1
        frame = layer.frames.new(frame_number)
        drawing = frame.drawing
        pose = pose_for(mode, stage)
        ellipse(drawing,pose.get("shift",0),.025, .54*pose.get("scale",1),.055, GUIDE, .015)
        draw_person(drawing,pose)
        if mode in ("side_step","guard_step","boundary_raise","exit_turn","cover_raise") and stage == 2:
            arrow(drawing,(-.65,.34),(-.05,.34))
        if mode == "retreat_step" and stage > 0:
            arrow(drawing,(.78,.50),(.78,.95))
        scene.frame_set(frame_number)
        scene.render.filepath = str(OUT / f"{mode}-{stage+1}.webp")
        bpy.ops.render.render(write_still=True, scene=scene.name)
scene.frame_set(20)  # Retreat study, middle frame, for inspection in Blender.
for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        area.spaces.active.region_3d.view_perspective = "CAMERA"
print("Rendered", len(modes)*3, "Grease Pencil movement frames to", OUT)
