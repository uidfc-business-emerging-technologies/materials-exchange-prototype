import Link from "next/link";
import { disciplineParts, filterHref, type DisciplineKey } from "@/lib/data";

interface DisciplineLinksProps {
  /** The discipline line, such as "Emerging technology and audit". */
  discipline: string;
  /** The material's own discipline, for parts that aren't one, like Ethics. */
  d: DisciplineKey;
  className?: string;
}

/** A material's discipline line, with each discipline in it linked to Browse filtered to it. */
export function DisciplineLinks({ discipline, d, className }: DisciplineLinksProps) {
  return (
    <>
      {disciplineParts(discipline, d).map((p, i) =>
        p.filter ? (
          <Link key={i} href={filterHref("disc", p.filter)} className={className}>
            {p.text}
          </Link>
        ) : (
          p.text
        ),
      )}
    </>
  );
}

/** "Case · Emerging technology and audit", with the type and each discipline linked to Browse. */
export function CategoryLine({ type, className, ...rest }: DisciplineLinksProps & { /** Case, Data exercise, or Teaching module. */ type: string }) {
  return (
    <>
      <Link href={filterHref("type", type)} className={className}>
        {type}
      </Link>
      {" · "}
      <DisciplineLinks {...rest} className={className} />
    </>
  );
}
