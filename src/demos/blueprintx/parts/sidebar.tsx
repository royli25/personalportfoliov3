import {
  Chevron,
  DRAG,
  Icon,
  NO_DRAG,
  WindowControls,
  type IconName,
} from "./primitives";

/**
 * BlueprintX — desktop sidebar (Figma component `Sidebar / Desktop`, 207:29).
 *
 * 260px fixed, 8pt grid. Groups collapse in the real product; on canvas the
 * chevron is decoration, so it renders as a static glyph here too.
 *
 * The sidebar is the Electron shell's drag surface, but a drag region eats
 * clicks — so every row that actually navigates opts out with NO_DRAG. Get
 * that wrong and the nav silently stops working in the shell while still
 * working in the browser.
 */

export type NavItem = {
  label: string;
  icon: IconName;
  /** Which screen this row opens. Rows without one are chrome, not controls. */
  screen?: "database" | "meeting" | "resources";
};

export type NavGroup = {
  /** Rendered uppercase, 11px, +6% tracking. */
  title: string;
  items: NavItem[];
};

export function Sidebar({
  product = "BlueprintX",
  groups,
  /** Label of the row to render as current. */
  active,
  onSelect,
}: {
  product?: string;
  groups: NavGroup[];
  active: string;
  onSelect: (screen: "database" | "meeting" | "resources") => void;
}) {
  return (
    <div
      className="flex h-full w-[260px] shrink-0 flex-col gap-[28px] bg-[#f2f2f0] px-[16px] py-[20px]"
      style={DRAG}
    >
      <WindowControls />

      <div className="flex items-center gap-[10px] pl-[4px]">
        <Icon name="logo-mark" size={24} />
        <p className="text-[20px] leading-[22px] font-medium whitespace-nowrap text-[#1a1a1a]">
          {product}
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="flex w-full flex-col gap-[2px]">
          <div className="flex h-[28px] w-[228px] items-center justify-between px-[12px]">
            <p className="text-[11px] leading-[16px] font-medium tracking-[0.66px] whitespace-nowrap text-[#9b9b9b] uppercase">
              {group.title}
            </p>
            <Chevron direction="up" />
          </div>

          {group.items.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={item.label === active}
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function NavRow({
  item,
  active,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  onSelect: (screen: "database" | "meeting" | "resources") => void;
}) {
  const body = (
    <>
      <Icon name={item.icon} size={20} />
      <p
        className={`text-[14px] leading-[20px] whitespace-nowrap ${
          active ? "font-medium text-[#1a1a1a]" : "text-[#4a4a4a]"
        }`}
      >
        {item.label}
      </p>
    </>
  );

  const shell = `flex h-[40px] w-[228px] items-center gap-[12px] rounded-[8px] px-[12px] text-left ${
    active ? "bg-[rgba(104,104,104,0.1)]" : ""
  }`;

  if (!item.screen) {
    // Unbuilt destination — stays part of the drag surface rather than
    // offering a click that would go nowhere on camera.
    return <div className={shell}>{body}</div>;
  }

  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(item.screen!)}
      style={NO_DRAG}
      className={`${shell} transition-colors duration-100 ${
        active ? "" : "hover:bg-[rgba(104,104,104,0.06)]"
      }`}
    >
      {body}
    </button>
  );
}
