// Pure CSS character silhouette shown during the 3-second pre-level intro.
// No image assets. Pose variants via the `pose` prop.

export default function CharacterSilhouette({ pose = 'rigid' }) {
  // 'still' and 'computing' don't breathe — they have their own animations.
  const breathes = pose !== 'still' && pose !== 'computing';

  return (
    <div className={`silhouette silhouette--${pose}${breathes ? ' silhouette-breathing' : ''}`}>
      <div className="silhouette-head" />
      <div className="silhouette-shoulders" />
      <div className="silhouette-torso" />
    </div>
  );
}
