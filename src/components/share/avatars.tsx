"use client";

import type { AvatarVariant } from "@/lib/share-avatars";
import { T } from "./share-theme";

/* Modest, faceless silhouettes — dignified stand-ins when a profile is
   shared without photos. Drawn inline so they stay crisp at any size. */

const ROSE_BG = "#FBE3EC";
const ROSE_MID = "#E2A6BC";
const ROSE_DEEP = "#B4637F";
const BLUE_BG = "#E3ECFB";
const BLUE_MID = "#A6BCE2";
const BLUE_DEEP = "#5C7BAE";
const SKIN = "#F6E4E0";

function Shoulders({ fill }: { fill: string }) {
  return <path d="M14 120 C14 96 33 84 60 84 C87 84 106 96 106 120 Z" fill={fill} />;
}

export function ProfileAvatar({ variant, className, style }: {
  variant: AvatarVariant;
  className?: string;
  style?: React.CSSProperties;
}) {
  const female = variant === "muslimah" || variant === "woman";
  const bg = female ? ROSE_BG : BLUE_BG;
  const mid = female ? ROSE_MID : BLUE_MID;
  const deep = female ? ROSE_DEEP : BLUE_DEEP;

  return (
    <svg viewBox="0 0 120 120" className={className} style={style} role="img" aria-hidden>
      <circle cx="60" cy="60" r="60" fill={bg} />

      {variant === "muslimah" && (
        <>
          {/* drape falls over the shoulders */}
          <path d="M60 20 C37 20 26 38 26 60 C26 80 30 96 32 120 L88 120 C90 96 94 80 94 60 C94 38 83 20 60 20 Z" fill={deep} />
          <ellipse cx="60" cy="56" rx="19" ry="23" fill={SKIN} />
          {/* inner band framing the face */}
          <path d="M60 33 C48 33 41 43 41 56 C41 66 45 74 50 78 C44 74 38 66 38 54 C38 40 47 31 60 31 C73 31 82 40 82 54 C82 66 76 74 70 78 C75 74 79 66 79 56 C79 43 72 33 60 33 Z" fill={mid} />
          <path d="M38 84 C44 90 52 93 60 93 C68 93 76 90 82 84 C86 96 88 108 88 120 L32 120 C32 108 34 96 38 84 Z" fill={mid} />
        </>
      )}

      {variant === "woman" && (
        <>
          <circle cx="60" cy="30" r="11" fill={deep} />
          <path d="M60 24 C42 24 33 38 33 56 C33 68 36 76 40 82 L80 82 C84 76 87 68 87 56 C87 38 78 24 60 24 Z" fill={deep} />
          <ellipse cx="60" cy="56" rx="19" ry="23" fill={SKIN} />
          <path d="M41 48 C41 36 49 30 60 30 C71 30 79 36 79 48 C74 42 68 39 60 39 C52 39 46 42 41 48 Z" fill={deep} />
          <Shoulders fill={mid} />
        </>
      )}

      {(variant === "man" || variant === "man_beard" || variant === "man_peci") && (
        <>
          <ellipse cx="60" cy="54" rx="20" ry="24" fill={SKIN} />
          {variant === "man_peci" ? (
            <path d="M38 36 C38 26 47 20 60 20 C73 20 82 26 82 36 C82 38 81 39 79 39 L41 39 C39 39 38 38 38 36 Z" fill={deep} />
          ) : (
            <path d="M40 46 C40 33 48 26 60 26 C72 26 80 33 80 46 C76 39 69 36 60 36 C51 36 44 39 40 46 Z" fill={deep} />
          )}
          {variant === "man_beard" && (
            <path d="M40 54 C40 74 49 84 60 84 C71 84 80 74 80 54 C80 68 72 74 60 74 C48 74 40 68 40 54 Z" fill={deep} />
          )}
          <Shoulders fill={mid} />
        </>
      )}
    </svg>
  );
}

/** Small swatch used by the builder's avatar picker. */
export function AvatarSwatch({ variant, selected, onClick, label }: {
  variant: AvatarVariant;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={selected}
      className="flex flex-col items-center gap-1.5"
    >
      <span
        className="block h-14 w-14 overflow-hidden rounded-full transition-all"
        style={{ boxShadow: selected ? `0 0 0 2px ${T.rose}` : `0 0 0 1px ${T.hairline}`, opacity: selected ? 1 : 0.65 }}
      >
        <ProfileAvatar variant={variant} className="h-full w-full" />
      </span>
      <span className="text-[10.5px] font-semibold" style={{ color: selected ? T.rose : T.muted }}>{label}</span>
    </button>
  );
}
