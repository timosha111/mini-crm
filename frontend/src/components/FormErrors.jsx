export default function FormErrors({ errors }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="alert alert-error">
      {errors.map((e) => <div key={e}>{e}</div>)}
    </div>
  );
}
