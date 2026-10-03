// Captions correspond to Grease Pencil frames rendered by tools/blender_training.py.
export const MOTION_GUIDES={
  ready_stance:[['Start','Stand naturally with room on both sides.'],['Make room','Place your feet at a comfortable width.'],['Settle','Keep your head above your feet.']],
  open_guard:[['Start','Keep your shoulders relaxed.'],['Open hands','Bring both hands below eye level.'],['See your route','Keep your view clear and feet balanced.']],
  head_cover:[['Start','Find your balance.'],['Cover','Bring your hands beside your head.'],['Keep sight','Look toward your way out.']],
  side_step:[['Start','Choose the open side.'],['Lead','Step into that space without crossing.'],['Follow','Bring your other foot under you.']],
  guard_step:[['Set a boundary','Show open hands below eye level.'],['Step','Move toward the open side.'],['Settle','Keep your hands available and feet uncrossed.']],
  boundary_raise:[['Notice space','Choose a clear side before moving.'],['Show your boundary','Raise both open hands below eye level.'],['Leave','Step toward the open route with hands up.']],
  retreat_step:[['Check behind','Only step where the floor is clear.'],['Step away','Move one foot back without leaning.'],['Regain balance','Bring the other foot back and stay upright.']],
  exit_turn:[['Find your exit','Choose a clear route at your side.'],['Turn','Rotate partway without crossing your feet.'],['Move','Take one step into that open space.']],
  cover_raise:[['Find space','Choose the side you can move toward.'],['Cover','Bring both hands beside your head.'],['Leave','Keep the cover and step into open space.']]
};
export const motionFrame=(id,index)=>`./assets/motion/${id}-${index+1}.webp`;
