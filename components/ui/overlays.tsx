"use client";

// Styled Base UI menus, dialogs, tabs, collapsibles, and toasts.
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Toast } from "@base-ui/react/toast";
import { Check, ChevronDown, Info, X } from "lucide-react";
import Link from "next/link";
import styles from "./overlays.module.css";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

// ---------- Menu ----------

export const MenuRoot = Menu.Root;
export const MenuTrigger = Menu.Trigger;

/** Portal + positioner + popup with the site's menu styling. */
export function MenuPopup({ children, align = "end", sideOffset = 6, className }: { children: React.ReactNode; align?: "start" | "center" | "end"; sideOffset?: number; className?: string }) {
  return (
    <Menu.Portal>
      <Menu.Positioner className={styles.positioner} align={align} sideOffset={sideOffset}>
        <Menu.Popup className={cx(styles.menu, className)}>{children}</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function MenuItem({ icon, children, danger, ...rest }: { icon?: React.ReactNode; danger?: boolean } & React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item className={cx(styles.menuItem, danger && styles.menuDanger)} {...rest}>
      {icon}
      {children}
    </Menu.Item>
  );
}

/** Menu item that navigates with client-side routing. */
export function MenuLinkItem({ icon, href, children }: { icon?: React.ReactNode; href: string; children: React.ReactNode }) {
  return (
    <Menu.LinkItem className={styles.menuItem} render={<Link href={href} />}>
      {icon}
      {children}
    </Menu.LinkItem>
  );
}

export function MenuSeparator() {
  return <Menu.Separator className={styles.menuSeparator} />;
}

export function MenuHeader({ children }: { children: React.ReactNode }) {
  return <div className={styles.menuHeader}>{children}</div>;
}

// ---------- Dialog ----------

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** "sheet" slides up from the bottom on phones (mobile filters). */
  variant?: "center" | "sheet";
  width?: number;
}

export function Modal({ open, onOpenChange, title, description, children, footer, variant = "center", width = 520 }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={cx(styles.dialog, variant === "sheet" && styles.sheet)} style={{ width: variant === "sheet" ? undefined : `min(${width}px, calc(100vw - 32px))` }}>
          <div className={styles.dialogHead}>
            <Dialog.Title className={styles.dialogTitle}>{title}</Dialog.Title>
            <Dialog.Close className={styles.dialogClose} aria-label="Close">
              <X size={20} aria-hidden />
            </Dialog.Close>
          </div>
          {description ? <Dialog.Description className={styles.dialogDesc}>{description}</Dialog.Description> : null}
          {children ? <div className={styles.dialogBody}>{children}</div> : null}
          {footer ? <div className={styles.dialogFoot}>{footer}</div> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------- Tabs ----------

export const TabsRoot = BaseTabs.Root;
export const TabsPanel = BaseTabs.Panel;

/** Underlined tab list (admin queues). */
export function TabsList({ tabs, label, className }: { tabs: { value: string; label: React.ReactNode; count?: number }[]; label: string; className?: string }) {
  return (
    <BaseTabs.List className={cx(styles.tabsList, className)} aria-label={label}>
      {tabs.map((t) => (
        <BaseTabs.Tab key={t.value} value={t.value} className={styles.tab}>
          {t.label}
          {t.count !== undefined ? <span className={styles.tabCount}>{t.count}</span> : null}
        </BaseTabs.Tab>
      ))}
      <BaseTabs.Indicator className={styles.tabIndicator} />
    </BaseTabs.List>
  );
}

// ---------- Collapsible ----------

/** A disclosure row with a chevron (version history, "Show 9 more tools"). */
export function Disclosure({ summary, meta, children, defaultOpen, className }: { summary: React.ReactNode; meta?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <BaseCollapsible.Root defaultOpen={defaultOpen} className={cx(styles.disclosure, className)}>
      <BaseCollapsible.Trigger className={styles.disclosureTrigger}>
        <span className={styles.disclosureSummary}>{summary}</span>
        {meta ? <span className={styles.disclosureMeta}>{meta}</span> : null}
        <ChevronDown size={16} className={styles.disclosureChevron} aria-hidden />
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className={styles.disclosurePanel}>{children}</BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

// ---------- Toast ----------

const toastManager = Toast.createToastManager();

export type ToastIcon = React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;

/** Shows a short status message at the bottom of the screen. Safe to call from any handler. */
export function toast(message: string, Icon: ToastIcon = Check) {
  toastManager.add({ title: message, data: { Icon }, timeout: 2800 });
}

export function infoToast(message: string) {
  toast(message, Info);
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => {
    const Icon = ((t.data as { Icon?: ToastIcon } | undefined)?.Icon || Check) as ToastIcon;
    return (
      <Toast.Root key={t.id} toast={t} className={styles.toast}>
        <Toast.Content className={styles.toastContent}>
          <Icon size={17} aria-hidden />
          <Toast.Title className={styles.toastTitle} />
        </Toast.Content>
      </Toast.Root>
    );
  });
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} limit={1}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className={styles.toastViewport}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
