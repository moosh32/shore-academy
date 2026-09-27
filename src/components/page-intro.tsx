export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {kicker ? <p className="text-primary text-sm">{kicker}</p> : null}
      <h1 className="mt-1 text-3xl leading-tight font-medium md:text-4xl">{title}</h1>
      {children ? (
        <div className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7">{children}</div>
      ) : null}
    </header>
  );
}
