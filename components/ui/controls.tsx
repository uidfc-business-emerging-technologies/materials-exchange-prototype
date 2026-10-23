"use client";

// Styled Base UI controls shared across the site and admin screens.
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Check, ChevronDown, CircleAlert, Minus } from "lucide-react";
import { useId } from "react";
import styles from "./controls.module.css";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

// ---------- Checkbox ----------

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
  /** Extra text at the end of the row, such as a result count. */
  trailing?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Shows the error border. */
  invalid?: boolean;
  /** Some but not all rows are selected. */
  indeterminate?: boolean;
  /** Accessible name when there is no visible label (table row selection). */
  ariaLabel?: string;
}

/** Checkbox with a visible label. The whole row is the hit target. */
export function Checkbox({ checked, onCheckedChange, children, trailing, description, disabled, size = "sm", className, invalid, indeterminate, ariaLabel }: CheckboxProps) {
  const id = useId();
  return (
    <label className={cx(styles.checkRow, size === "md" && styles.checkRowMd, disabled && styles.disabled, className)}>
      <BaseCheckbox.Root
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v)}
        disabled={disabled}
        className={cx(styles.checkbox, invalid && styles.invalidBox)}
        aria-describedby={description ? id : undefined}
        aria-label={ariaLabel}
        indeterminate={indeterminate}
      >
        <BaseCheckbox.Indicator className={styles.checkIndicator}>
          {indeterminate ? <Minus size={13} strokeWidth={3} aria-hidden /> : <Check size={size === "md" ? 15 : 13} strokeWidth={3} aria-hidden />}
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span className={styles.checkText}>
        <span className={styles.checkLabel}>{children}</span>
        {description ? (
          <span id={id} className={styles.checkDesc}>
            {description}
          </span>
        ) : null}
      </span>
      {trailing !== undefined ? <span className={styles.checkTrailing}>{trailing}</span> : null}
    </label>
  );
}

// ---------- Switch ----------

export function Switch({ checked, onCheckedChange, label, description, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: React.ReactNode; description?: React.ReactNode; className?: string }) {
  return (
    <label className={cx(styles.switchRow, className)}>
      <span className={styles.switchText}>
        <span className={styles.switchLabel}>{label}</span>
        {description ? <span className={styles.switchDesc}>{description}</span> : null}
      </span>
      <BaseSwitch.Root checked={checked} onCheckedChange={(v) => onCheckedChange(v)} className={styles.switch}>
        <BaseSwitch.Thumb className={styles.thumb} />
      </BaseSwitch.Root>
    </label>
  );
}

// ---------- Text fields ----------

export interface TextFieldProps {
  label: React.ReactNode;
  /** Short help text under the label. */
  description?: React.ReactNode;
  /** Error message shown next to the field. */
  error?: string;
  optional?: boolean;
  value: string;
  onValueChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  name?: string;
  autoComplete?: string;
  multiline?: boolean;
  rows?: number;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  /** Text under the input, such as a character count. */
  footer?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  id?: string;
  hideLabel?: boolean;
}

/** Field with a visible label (never placeholder-only), description, and inline error. */
export function TextField(p: TextFieldProps) {
  const invalid = !!p.error;
  return (
    <Field.Root className={cx(styles.field, p.className)} invalid={invalid} disabled={p.disabled}>
      <Field.Label className={cx(styles.label, p.hideLabel && "sr-only")}>
        {p.label}
        {p.optional ? <span className={styles.optional}> (optional)</span> : null}
      </Field.Label>
      {p.description ? <Field.Description className={styles.description}>{p.description}</Field.Description> : null}
      <div className={cx(styles.inputWrap, invalid && styles.inputWrapInvalid, p.multiline && styles.inputWrapMulti)}>
        {p.leading ? <span className={styles.leading}>{p.leading}</span> : null}
        {p.multiline ? (
          <Field.Control
            render={<textarea rows={p.rows || 3} />}
            className={cx(styles.input, styles.textarea, p.inputClassName)}
            value={p.value}
            onValueChange={(v: string) => p.onValueChange(v)}
            placeholder={p.placeholder}
            name={p.name}
            required={p.required}
            maxLength={p.maxLength}
            id={p.id}
          />
        ) : (
          <Input
            className={cx(styles.input, p.inputClassName)}
            type={p.type || "text"}
            value={p.value}
            onValueChange={(v) => p.onValueChange(v)}
            placeholder={p.placeholder}
            name={p.name}
            autoComplete={p.autoComplete}
            required={p.required}
            maxLength={p.maxLength}
            inputMode={p.inputMode}
            id={p.id}
          />
        )}
        {p.trailing ? <span className={styles.trailing}>{p.trailing}</span> : null}
      </div>
      {p.error ? (
        <p className={styles.error} role="alert">
          <CircleAlert size={16} aria-hidden />
          {p.error}
        </p>
      ) : null}
      {p.footer ? <div className={styles.footer}>{p.footer}</div> : null}
    </Field.Root>
  );
}

// ---------- Select ----------

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
}

export interface SelectProps<V extends string> {
  value: V;
  onValueChange: (v: V) => void;
  options: SelectOption<V>[];
  label?: React.ReactNode;
  hideLabel?: boolean;
  /** Label shown inline before the value, for compact toolbars ("Sort by"). */
  inlineLabel?: string;
  description?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

/** Base UI Select with the site's input styling. */
export function Select<V extends string>({ value, onValueChange, options, label, hideLabel, description, size = "md", className, triggerClassName, disabled }: SelectProps<V>) {
  return (
    <Field.Root className={cx(styles.field, className)} disabled={disabled}>
      {label ? <Field.Label className={cx(styles.label, hideLabel && "sr-only")}>{label}</Field.Label> : null}
      {description ? <Field.Description className={styles.description}>{description}</Field.Description> : null}
      <BaseSelect.Root items={options} value={value} onValueChange={(v) => v !== null && onValueChange(v as V)} disabled={disabled}>
        <BaseSelect.Trigger className={cx(styles.selectTrigger, size === "sm" && styles.selectSm, triggerClassName)}>
          <BaseSelect.Value className={styles.selectValue} />
          <BaseSelect.Icon className={styles.selectIcon}>
            <ChevronDown size={16} aria-hidden />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner className={styles.positioner} sideOffset={4} alignItemWithTrigger={false}>
            <BaseSelect.Popup className={styles.popup}>
              <BaseSelect.List>
                {options.map((o) => (
                  <BaseSelect.Item key={o.value} value={o.value} className={styles.option}>
                    <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className={styles.optionCheck}>
                      <Check size={16} aria-hidden />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Field.Root>
  );
}

// ---------- Radio cards ----------

export interface RadioCardOption<V extends string = string> {
  value: V;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/** A radio group drawn as bordered cards (verify method, license, decision). */
export function RadioCards<V extends string>({
  value,
  onValueChange,
  options,
  label,
  hideLabel,
  layout = "stack",
  compact,
  className,
}: {
  value: V;
  onValueChange: (v: V) => void;
  options: RadioCardOption<V>[];
  label: React.ReactNode;
  hideLabel?: boolean;
  layout?: "stack" | "row" | "grid";
  /** Inline pill-sized radios, for short choices like Published or Unpublished. */
  compact?: boolean;
  className?: string;
}) {
  const labelId = useId();
  return (
    <div className={cx(styles.radioGroupWrap, className)}>
      <div id={labelId} className={cx(styles.label, hideLabel && "sr-only")}>
        {label}
      </div>
      <RadioGroup
        aria-labelledby={labelId}
        value={value}
        onValueChange={(v) => onValueChange(v as V)}
        className={cx(styles.radioGroup, layout === "row" && styles.radioRow, layout === "grid" && styles.radioGrid)}
      >
        {options.map((o) => (
          <label key={o.value} className={cx(styles.radioCard, compact && styles.radioCompact, o.value === value && styles.radioCardOn, o.disabled && styles.disabled)}>
            <Radio.Root value={o.value} disabled={o.disabled} className={styles.radio}>
              <Radio.Indicator className={styles.radioDot} />
            </Radio.Root>
            <span className={styles.radioText}>
              <span className={styles.radioLabel}>
                {o.icon}
                {o.label}
              </span>
              {o.description ? <span className={styles.radioDesc}>{o.description}</span> : null}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

// ---------- Segmented toggle ----------

export interface SegmentOption<V extends string = string> {
  value: V;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

/** Single-choice toggle group (List or Grid, admin status filters, date presets). */
export function Segmented<V extends string>({
  value,
  onValueChange,
  options,
  label,
  variant = "solid",
  className,
}: {
  value: V;
  onValueChange: (v: V) => void;
  options: SegmentOption<V>[];
  label: string;
  /** solid: navy selected segment inside a border. soft: gray track with a white selected chip. */
  variant?: "solid" | "soft";
  className?: string;
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(v) => v.length && onValueChange(v[0] as V)}
      className={cx(variant === "solid" ? styles.segSolid : styles.segSoft, className)}
    >
      {options.map((o) => (
        <Toggle key={o.value} value={o.value} className={variant === "solid" ? styles.segSolidItem : styles.segSoftItem}>
          {o.icon}
          {o.label}
          {o.count !== undefined ? <span className={styles.segCount}>{o.count}</span> : null}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

/** Small round tool or topic tag. */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx(styles.chip, className)}>{children}</span>;
}
