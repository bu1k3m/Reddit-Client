export function LaneSkeleton() {
  return (
    <ul className="lane-skeleton" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <li key={row} className="lane-skeleton__row">
          <div className="lane-skeleton__score" />
          <div className="lane-skeleton__lines">
            <div className="lane-skeleton__line lane-skeleton__line--title" />
            <div className="lane-skeleton__line lane-skeleton__line--title short" />
            <div className="lane-skeleton__line lane-skeleton__line--meta" />
          </div>
        </li>
      ))}
    </ul>
  );
}
