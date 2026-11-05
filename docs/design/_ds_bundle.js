/* @ds-bundle: {"format":4,"namespace":"SertOTechDesignSystem_26fb13","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"ToastViewport","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Input.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Icon","sourcePath":"components/media/Icon.jsx"},{"name":"IconNames","sourcePath":"components/media/Icon.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"c6d5b68250f3","components/buttons/IconButton.jsx":"002ed3e5e0bf","components/display/Badge.jsx":"43e192f34ee2","components/display/Card.jsx":"08c193236cec","components/display/Tag.jsx":"1ac5cb034ee8","components/feedback/Dialog.jsx":"54e7208bf5fe","components/feedback/Toast.jsx":"f4caf3133762","components/feedback/Tooltip.jsx":"0bf6d0cc5abb","components/forms/Checkbox.jsx":"ef536eacb35e","components/forms/Input.jsx":"fbb2e57991f8","components/forms/Radio.jsx":"08c43235516e","components/forms/Select.jsx":"933faab2a0bd","components/forms/Switch.jsx":"bb845257987b","components/media/Icon.jsx":"f19b1bd72360","components/navigation/Tabs.jsx":"8c0b655b8c2a","ui_kits/event-site/Agenda.jsx":"da1dd85e76b4","ui_kits/event-site/App.jsx":"739ff1ddcdd7","ui_kits/event-site/Footer.jsx":"20e90f4d3989","ui_kits/event-site/Header.jsx":"ae7c7ee2fc0b","ui_kits/event-site/Landing.jsx":"8adf7d6e64de","ui_kits/event-site/Register.jsx":"5417c6150888","ui_kits/event-site/Speakers.jsx":"3dcf6e2d7adf","ui_kits/event-site/data.js":"4f2bd8d12a7a","ui_kits/event-site/parts.jsx":"7295a25f82ac","ui_kits/painel/pn-app.jsx":"1ea80b5ebc44","ui_kits/painel/pn-core.jsx":"34ca45c8bab1","ui_kits/painel/pn-data.js":"bb3a7c3c05ef","ui_kits/painel/pn-materiais.jsx":"553bc1e979a7","ui_kits/painel/pn-orcamento.jsx":"321590d63b24","ui_kits/painel/pn-screens-a.jsx":"1e94d84e4bbb","ui_kits/painel/pn-shell.jsx":"ab8ef56598fd","ui_kits/painel/pn-spec.jsx":"c833c31dffd2"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/media/Icon.jsx"}]} */

(() => {

const __ds_ns = (window.SertOTechDesignSystem_26fb13 = window.SertOTechDesignSystem_26fb13 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    height: 36,
    padding: "0 18px",
    fontSize: "var(--text-sm)",
    gap: 6,
    icon: 16
  },
  md: {
    height: 46,
    padding: "0 26px",
    fontSize: "var(--text-base)",
    gap: 8,
    icon: 18
  },
  lg: {
    height: 56,
    padding: "0 34px",
    fontSize: "var(--text-lg)",
    gap: 10,
    icon: 20
  }
};
function variantStyle(variant, hover, active) {
  const press = active ? {
    transform: "translateY(1px)"
  } : {};
  const map = {
    primary: {
      background: active ? "var(--brand-primary-active)" : hover ? "var(--brand-primary-hover)" : "var(--brand-primary)",
      color: "var(--text-on-brand)",
      borderColor: "transparent",
      boxShadow: hover && !active ? "var(--shadow-sm)" : "none"
    },
    secondary: {
      background: active ? "var(--espresso-950)" : hover ? "var(--espresso-900)" : "var(--espresso-800)",
      color: "var(--text-on-ink)",
      borderColor: "transparent",
      boxShadow: hover && !active ? "var(--shadow-sm)" : "none"
    },
    accent: {
      background: active ? "var(--amber-600)" : hover ? "var(--amber-400)" : "var(--amber-500)",
      color: "var(--text-on-accent)",
      borderColor: "transparent",
      boxShadow: hover && !active ? "var(--shadow-sm)" : "none"
    },
    outline: {
      background: hover ? "var(--surface-hover)" : "transparent",
      color: "var(--brand-ink)",
      borderColor: "var(--espresso-800)"
    },
    ghost: {
      background: active ? "var(--surface-sunken)" : hover ? "var(--surface-hover)" : "transparent",
      color: "var(--brand-ink)",
      borderColor: "transparent"
    },
    danger: {
      background: active ? "var(--brick-600)" : hover ? "var(--brick-600)" : "var(--brick-500)",
      color: "var(--danger-fg)",
      borderColor: "transparent"
    }
  };
  return {
    ...(map[variant] || map.primary),
    ...press
  };
}
function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = "button",
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const sz = SIZES[size] || SIZES.md;
  const vs = variantStyle(variant, hover && !disabled, active && !disabled);
  const styles = {
    display: fullWidth ? "flex" : "inline-flex",
    width: fullWidth ? "100%" : "auto",
    alignItems: "center",
    justifyContent: "center",
    gap: sz.gap,
    height: sz.height,
    padding: sz.padding,
    fontSize: sz.fontSize,
    fontFamily: "var(--font-display)",
    fontWeight: "var(--fw-semibold)",
    letterSpacing: "var(--tracking-wide)",
    lineHeight: 1,
    borderRadius: "var(--radius-control)",
    borderStyle: "solid",
    borderWidth: 2,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
    textDecoration: "none",
    userSelect: "none",
    boxSizing: "border-box",
    transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
    ...vs,
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    style: styles,
    onMouseEnter: e => {
      setHover(true);
      onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHover(false);
      setActive(false);
      onMouseLeave?.(e);
    },
    onMouseDown: e => {
      setActive(true);
      onMouseDown?.(e);
    },
    onMouseUp: e => {
      setActive(false);
      onMouseUp?.(e);
    }
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    }
  }, iconLeft) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 36,
  md: 46,
  lg: 56
};
function variantStyle(variant, hover, active) {
  const map = {
    primary: {
      background: active ? "var(--brand-primary-active)" : hover ? "var(--brand-primary-hover)" : "var(--brand-primary)",
      color: "var(--text-on-brand)",
      borderColor: "transparent"
    },
    secondary: {
      background: active ? "var(--espresso-950)" : hover ? "var(--espresso-900)" : "var(--espresso-800)",
      color: "var(--text-on-ink)",
      borderColor: "transparent"
    },
    accent: {
      background: active ? "var(--amber-600)" : hover ? "var(--amber-400)" : "var(--amber-500)",
      color: "var(--text-on-accent)",
      borderColor: "transparent"
    },
    outline: {
      background: hover ? "var(--surface-hover)" : "transparent",
      color: "var(--brand-ink)",
      borderColor: "var(--espresso-800)"
    },
    ghost: {
      background: active ? "var(--surface-sunken)" : hover ? "var(--surface-hover)" : "transparent",
      color: "var(--brand-ink)",
      borderColor: "transparent"
    }
  };
  return {
    ...(map[variant] || map.ghost),
    ...(active ? {
      transform: "translateY(1px)"
    } : {})
  };
}
function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const dim = SIZES[size] || SIZES.md;
  const vs = variantStyle(variant, hover && !disabled, active && !disabled);
  const styles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: dim,
    height: dim,
    padding: 0,
    borderRadius: "var(--radius-pill)",
    borderStyle: "solid",
    borderWidth: 2,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
    ...vs,
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    "aria-label": label,
    title: label,
    style: styles,
    onMouseEnter: e => {
      setHover(true);
      onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHover(false);
      setActive(false);
      onMouseLeave?.(e);
    },
    onMouseDown: e => {
      setActive(true);
      onMouseDown?.(e);
    },
    onMouseUp: e => {
      setActive(false);
      onMouseUp?.(e);
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const COLORS = {
  neutral: {
    solid: ["var(--espresso-800)", "var(--sand-50)"],
    soft: ["var(--sand-200)", "var(--espresso-700)"],
    line: "var(--sand-500)"
  },
  primary: {
    solid: ["var(--terra-600)", "var(--text-on-brand)"],
    soft: ["var(--terra-100)", "var(--terra-700)"],
    line: "var(--terra-600)"
  },
  accent: {
    solid: ["var(--amber-500)", "var(--espresso-900)"],
    soft: ["var(--amber-100)", "var(--amber-600)"],
    line: "var(--amber-600)"
  },
  success: {
    solid: ["var(--cactus-500)", "var(--success-fg)"],
    soft: ["var(--cactus-100)", "var(--cactus-600)"],
    line: "var(--cactus-600)"
  },
  warning: {
    solid: ["var(--honey-500)", "var(--warning-fg)"],
    soft: ["var(--honey-100)", "var(--honey-600)"],
    line: "var(--honey-600)"
  },
  danger: {
    solid: ["var(--brick-500)", "var(--danger-fg)"],
    soft: ["var(--brick-100)", "var(--brick-600)"],
    line: "var(--brick-600)"
  },
  info: {
    solid: ["var(--agave-500)", "var(--info-fg)"],
    soft: ["var(--agave-100)", "var(--agave-600)"],
    line: "var(--agave-600)"
  }
};
function Badge({
  children,
  variant = "neutral",
  tone = "soft",
  size = "md",
  icon,
  dot = false,
  style,
  ...rest
}) {
  const c = COLORS[variant] || COLORS.neutral;
  const pad = size === "sm" ? "2px 8px" : "3px 11px";
  const fs = size === "sm" ? "var(--text-2xs)" : "var(--text-xs)";
  let look;
  if (tone === "solid") look = {
    background: c.solid[0],
    color: c.solid[1],
    border: "1px solid transparent"
  };else if (tone === "outline") look = {
    background: "transparent",
    color: c.line,
    border: `1.5px solid ${c.line}`
  };else look = {
    background: c.soft[0],
    color: c.soft[1],
    border: "1px solid transparent"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: pad,
      fontFamily: "var(--font-mono)",
      fontSize: fs,
      fontWeight: "var(--fw-bold)",
      letterSpacing: "var(--tracking-wide)",
      textTransform: "uppercase",
      borderRadius: "var(--radius-pill)",
      lineHeight: 1.4,
      whiteSpace: "nowrap",
      ...look,
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "currentColor"
    }
  }) : null, icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function variantStyle(variant) {
  switch (variant) {
    case "elevated":
      return {
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-md)"
      };
    case "outline":
      return {
        background: "var(--surface-card)",
        border: "2px solid var(--espresso-800)",
        boxShadow: "none"
      };
    case "ink":
      return {
        background: "var(--surface-ink)",
        border: "1px solid var(--border-on-ink)",
        color: "var(--text-on-ink)",
        boxShadow: "var(--shadow-md)"
      };
    case "badge":
      // signature hard sticker card
      return {
        background: "var(--surface-card)",
        border: "2px solid var(--border-ink)",
        boxShadow: "var(--shadow-badge)"
      };
    case "sunken":
      return {
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "none"
      };
    default:
      return {
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)"
      };
  }
}
function Card({
  variant = "default",
  interactive = false,
  padding = 24,
  as = "div",
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const lift = interactive && hover ? {
    transform: "translateY(-3px)",
    boxShadow: variant === "badge" ? "8px 8px 0 var(--border-ink)" : "var(--shadow-lg)"
  } : {};
  const styles = {
    borderRadius: "var(--radius-card)",
    padding: typeof padding === "number" ? `${padding}px` : padding,
    boxSizing: "border-box",
    transition: "transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)",
    cursor: interactive ? "pointer" : "default",
    ...variantStyle(variant),
    ...lift,
    ...style
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: styles,
    onMouseEnter: e => {
      setHover(true);
      onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHover(false);
      onMouseLeave?.(e);
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  color = "sand",
  icon,
  onRemove,
  removeLabel = "Remover",
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const palettes = {
    sand: ["var(--sand-200)", "var(--espresso-700)", "var(--sand-400)"],
    terra: ["var(--terra-100)", "var(--terra-700)", "var(--terra-400)"],
    amber: ["var(--amber-100)", "var(--amber-600)", "var(--amber-400)"],
    cactus: ["var(--cactus-100)", "var(--cactus-600)", "var(--cactus-500)"],
    agave: ["var(--agave-100)", "var(--agave-600)", "var(--agave-500)"]
  };
  const [bg, fg, dotc] = palettes[color] || palettes.sand;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: onRemove ? "5px 6px 5px 12px" : "5px 12px",
      background: bg,
      color: fg,
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--fw-medium)",
      lineHeight: 1.3,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    }
  }, icon) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: dotc,
      flexShrink: 0
    }
  }), children, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": removeLabel,
    onClick: onRemove,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 18,
      height: 18,
      padding: 0,
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      background: hover ? "rgba(60,33,11,0.14)" : "transparent",
      color: "inherit"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  }))) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
const SIZES = {
  sm: 420,
  md: 540,
  lg: 720
};
function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  style
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onMouseDown: e => {
      if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-6)",
      background: "rgba(31,19,5,0.55)",
      backdropFilter: "blur(3px)",
      animation: "stFade var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "min(100%, " + SIZES[size] + "px)",
      maxHeight: "88vh",
      overflow: "auto",
      background: "var(--surface-card)",
      borderRadius: "var(--radius-xl)",
      border: "2px solid var(--border-ink)",
      boxShadow: "var(--shadow-xl)",
      animation: "stPop var(--dur-slow) var(--ease-bounce)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      padding: "24px 24px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, title ? /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      color: "var(--text-strong)",
      margin: 0
    }
  }, title) : null, description ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      color: "var(--text-muted)",
      fontSize: "var(--text-base)"
    }
  }, description) : null), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Fechar",
    onClick: onClose,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      flexShrink: 0,
      border: "none",
      borderRadius: "var(--radius-pill)",
      background: "var(--surface-sunken)",
      cursor: "pointer",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px 24px",
      color: "var(--text-body)"
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      padding: "0 24px 24px"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const KIND = {
  info: {
    accent: "var(--agave-500)",
    soft: "var(--agave-100)",
    icon: "info"
  },
  success: {
    accent: "var(--cactus-500)",
    soft: "var(--cactus-100)",
    icon: "check-circle"
  },
  warning: {
    accent: "var(--honey-600)",
    soft: "var(--honey-100)",
    icon: "alert-triangle"
  },
  danger: {
    accent: "var(--brick-500)",
    soft: "var(--brick-100)",
    icon: "alert-triangle"
  }
};
const ICONS = {
  info: [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "M12 16v-4"
  }], ["path", {
    d: "M12 8h.01"
  }]],
  "check-circle": [["path", {
    d: "M21.801 10A10 10 0 1 1 17 3.335"
  }], ["path", {
    d: "m9 11 3 3L22 4"
  }]],
  "alert-triangle": [["path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
  }], ["path", {
    d: "M12 9v4"
  }], ["path", {
    d: "M12 17h.01"
  }]]
};
function Toast({
  variant = "info",
  title,
  description,
  action,
  onClose,
  style
}) {
  const k = KIND[variant] || KIND.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      width: "min(100%, 400px)",
      padding: "14px 16px",
      background: "var(--surface-card)",
      border: "2px solid var(--border-ink)",
      borderLeft: `6px solid ${k.accent}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      height: 30,
      flexShrink: 0,
      borderRadius: "50%",
      background: k.soft,
      color: k.accent
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, ICONS[k.icon].map((p, i) => React.createElement(p[0], {
    key: i,
    ...p[1]
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--text-base)",
      color: "var(--text-strong)"
    }
  }, title) : null, description ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, description) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, action) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Fechar",
    onClick: onClose,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 26,
      height: 26,
      flexShrink: 0,
      border: "none",
      background: "transparent",
      borderRadius: "50%",
      cursor: "pointer",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  }))) : null);
}

/** Fixed-position stack container for toasts. */
function ToastViewport({
  position = "bottom-right",
  children,
  style
}) {
  const pos = {
    "bottom-right": {
      bottom: 20,
      right: 20,
      alignItems: "flex-end"
    },
    "bottom-left": {
      bottom: 20,
      left: 20,
      alignItems: "flex-start"
    },
    "top-right": {
      top: 20,
      right: 20,
      alignItems: "flex-end"
    },
    "top-left": {
      top: 20,
      left: 20,
      alignItems: "flex-start"
    }
  }[position];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      zIndex: 1100,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      ...pos,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Toast, ToastViewport });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  placement = "top",
  children,
  style
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, children, show ? /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: 1200,
      ...pos,
      background: "var(--espresso-900)",
      color: "var(--sand-50)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--fw-medium)",
      padding: "6px 10px",
      borderRadius: "var(--radius-sm)",
      whiteSpace: "nowrap",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none",
      animation: "stFade var(--dur-fast) var(--ease-standard)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId?.() || undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const toggle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange?.(e);
  };
  const box = {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: "var(--radius-xs)",
    border: `2px solid ${on ? "var(--brand-primary)" : "var(--border-strong)"}`,
    background: on ? "var(--brand-primary)" : "var(--surface-card)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)"
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: toggle,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: box
  }, on ? /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-on-brand)",
    strokeWidth: "3.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const H = {
  sm: 38,
  md: 46,
  lg: 54
};
const FS = {
  sm: "var(--text-sm)",
  md: "var(--text-base)",
  lg: "var(--text-lg)"
};
function Field({
  label,
  hint,
  error,
  htmlFor,
  required,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger)",
      marginLeft: 3
    }
  }, "*") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--danger)",
      fontWeight: "var(--fw-medium)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, hint) : null);
}
function Input({
  label,
  hint,
  error,
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  id,
  style,
  className,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const rid = id || React.useId?.() || undefined;
  const invalid = !!error;
  const box = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: H[size],
    padding: "0 14px",
    background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
    border: `2px solid ${invalid ? "var(--danger)" : focus ? "var(--espresso-800)" : "var(--border-default)"}`,
    borderRadius: "var(--radius-field)",
    boxShadow: focus ? "var(--shadow-focus)" : "none",
    transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)",
    opacity: disabled ? 0.6 : 1,
    boxSizing: "border-box"
  };
  const input = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-body)",
    fontSize: FS[size],
    color: "var(--text-body)",
    height: "100%",
    padding: 0
  };
  const field = /*#__PURE__*/React.createElement("div", {
    style: box,
    className: className
  }, iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--text-muted)"
    }
  }, iconLeft) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    disabled: disabled,
    "aria-invalid": invalid,
    style: input,
    onFocus: e => {
      setFocus(true);
      onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur?.(e);
    }
  }, rest)), iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--text-muted)"
    }
  }, iconRight) : null);
  if (!label && !hint && !error) return field;
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: rid,
    required: rest.required,
    style: style
  }, field);
}
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  disabled = false,
  id,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const rid = id || React.useId?.() || undefined;
  const invalid = !!error;
  const ta = {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    padding: "12px 14px",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-base)",
    color: "var(--text-body)",
    background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
    border: `2px solid ${invalid ? "var(--danger)" : focus ? "var(--espresso-800)" : "var(--border-default)"}`,
    borderRadius: "var(--radius-field)",
    outline: "none",
    boxShadow: focus ? "var(--shadow-focus)" : "none",
    transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)",
    lineHeight: "var(--leading-normal)"
  };
  const field = /*#__PURE__*/React.createElement("textarea", _extends({
    id: rid,
    rows: rows,
    disabled: disabled,
    "aria-invalid": invalid,
    style: ta,
    onFocus: e => {
      setFocus(true);
      onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur?.(e);
    }
  }, rest));
  if (!label && !hint && !error) return field;
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: rid,
    required: rest.required,
    style: style
  }, field);
}
Object.assign(__ds_scope, { Field, Input, Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  checked,
  name,
  value,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId?.() || undefined;
  const outer = {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: "var(--radius-pill)",
    border: `2px solid ${checked ? "var(--brand-primary)" : "var(--border-strong)"}`,
    background: "var(--surface-card)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color var(--dur-fast) var(--ease-standard)"
  };
  const dot = {
    width: 11,
    height: 11,
    borderRadius: "var(--radius-pill)",
    background: "var(--brand-primary)",
    transform: checked ? "scale(1)" : "scale(0)",
    transition: "transform var(--dur-fast) var(--ease-bounce)"
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: outer
  }, /*#__PURE__*/React.createElement("span", {
    style: dot
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)"
    }
  }, label) : null);
}
function RadioGroup({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Radio, RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const H = {
  sm: 38,
  md: 46,
  lg: 54
};
const FS = {
  sm: "var(--text-sm)",
  md: "var(--text-base)",
  lg: "var(--text-lg)"
};
function Select({
  label,
  hint,
  error,
  size = "md",
  options = [],
  placeholder,
  disabled = false,
  id,
  style,
  children,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const rid = id || React.useId?.() || undefined;
  const invalid = !!error;
  const wrap = {
    position: "relative",
    display: "flex",
    alignItems: "center"
  };
  const sel = {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    width: "100%",
    boxSizing: "border-box",
    height: H[size],
    padding: "0 40px 0 14px",
    fontFamily: "var(--font-body)",
    fontSize: FS[size],
    color: "var(--text-body)",
    background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
    border: `2px solid ${invalid ? "var(--danger)" : focus ? "var(--espresso-800)" : "var(--border-default)"}`,
    borderRadius: "var(--radius-field)",
    outline: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: focus ? "var(--shadow-focus)" : "none",
    transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)",
    opacity: disabled ? 0.6 : 1
  };
  const chevron = /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-muted)",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      position: "absolute",
      right: 14,
      pointerEvents: "none"
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }));
  const field = /*#__PURE__*/React.createElement("div", {
    style: wrap
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: rid,
    disabled: disabled,
    "aria-invalid": invalid,
    style: sel,
    onFocus: e => {
      setFocus(true);
      onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur?.(e);
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder) : null, options.map(o => {
    const val = typeof o === "object" ? o.value : o;
    const lab = typeof o === "object" ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  }), children), chevron);
  if (!label && !hint && !error) return field;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: rid,
    required: rest.required,
    style: style
  }, field);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SZ = {
  sm: {
    w: 38,
    h: 22,
    k: 16
  },
  md: {
    w: 46,
    h: 26,
    k: 20
  }
};
function Switch({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  size = "md",
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId?.() || undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const s = SZ[size] || SZ.md;
  const toggle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange?.(e);
  };
  const track = {
    width: s.w,
    height: s.h,
    borderRadius: "var(--radius-pill)",
    flexShrink: 0,
    background: on ? "var(--brand-primary)" : "var(--sand-400)",
    padding: 3,
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    transition: "background var(--dur-base) var(--ease-standard)"
  };
  const knob = {
    width: s.k,
    height: s.k,
    borderRadius: "var(--radius-pill)",
    background: "var(--sand-50)",
    boxShadow: "var(--shadow-sm)",
    transform: on ? `translateX(${s.w - s.k - 6}px)` : "translateX(0)",
    transition: "transform var(--dur-base) var(--ease-bounce)"
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "checkbox",
    role: "switch",
    checked: on,
    disabled: disabled,
    onChange: toggle,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: track
  }, /*#__PURE__*/React.createElement("span", {
    style: knob
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/media/Icon.jsx
try { (() => {
/* Curated Lucide icon set (MIT-licensed, copied path data). The brand ships no
 * icon set of its own, so Sertão Tech standardizes on Lucide's rounded 2px
 * stroke look — warm and friendly, matching the wordmark. See readme → ICONOGRAPHY. */
const ICONS = {
  "arrow-right": [["path", {
    d: "M5 12h14"
  }], ["path", {
    d: "m12 5 7 7-7 7"
  }]],
  "arrow-left": [["path", {
    d: "M19 12H5"
  }], ["path", {
    d: "m12 19-7-7 7-7"
  }]],
  "arrow-up-right": [["path", {
    d: "M7 7h10v10"
  }], ["path", {
    d: "M7 17 17 7"
  }]],
  "chevron-down": [["path", {
    d: "m6 9 6 6 6-6"
  }]],
  "chevron-up": [["path", {
    d: "m18 15-6-6-6 6"
  }]],
  "chevron-right": [["path", {
    d: "m9 18 6-6-6-6"
  }]],
  "chevron-left": [["path", {
    d: "m15 18-6-6 6-6"
  }]],
  check: [["path", {
    d: "M20 6 9 17l-5-5"
  }]],
  x: [["path", {
    d: "M18 6 6 18"
  }], ["path", {
    d: "m6 6 12 12"
  }]],
  plus: [["path", {
    d: "M5 12h14"
  }], ["path", {
    d: "M12 5v14"
  }]],
  minus: [["path", {
    d: "M5 12h14"
  }]],
  menu: [["path", {
    d: "M4 6h16"
  }], ["path", {
    d: "M4 12h16"
  }], ["path", {
    d: "M4 18h16"
  }]],
  search: [["circle", {
    cx: 11,
    cy: 11,
    r: 8
  }], ["path", {
    d: "m21 21-4.3-4.3"
  }]],
  calendar: [["path", {
    d: "M8 2v4"
  }], ["path", {
    d: "M16 2v4"
  }], ["rect", {
    width: 18,
    height: 18,
    x: 3,
    y: 4,
    rx: 2
  }], ["path", {
    d: "M3 10h18"
  }]],
  clock: [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "M12 6v6l4 2"
  }]],
  "map-pin": [["path", {
    d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
  }], ["circle", {
    cx: 12,
    cy: 10,
    r: 3
  }]],
  users: [["path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }], ["circle", {
    cx: 9,
    cy: 7,
    r: 4
  }], ["path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }], ["path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  }]],
  mic: [["path", {
    d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
  }], ["path", {
    d: "M19 10v2a7 7 0 0 1-14 0v-2"
  }], ["path", {
    d: "M12 19v3"
  }]],
  code: [["path", {
    d: "m16 18 6-6-6-6"
  }], ["path", {
    d: "m8 6-6 6 6 6"
  }]],
  heart: [["path", {
    d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
  }]],
  star: [["polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"
  }]],
  ticket: [["path", {
    d: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
  }], ["path", {
    d: "M13 5v2"
  }], ["path", {
    d: "M13 17v2"
  }], ["path", {
    d: "M13 11v2"
  }]],
  "external-link": [["path", {
    d: "M15 3h6v6"
  }], ["path", {
    d: "M10 14 21 3"
  }], ["path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
  }]],
  info: [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "M12 16v-4"
  }], ["path", {
    d: "M12 8h.01"
  }]],
  "check-circle": [["path", {
    d: "M21.801 10A10 10 0 1 1 17 3.335"
  }], ["path", {
    d: "m9 11 3 3L22 4"
  }]],
  "alert-triangle": [["path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
  }], ["path", {
    d: "M12 9v4"
  }], ["path", {
    d: "M12 17h.01"
  }]],
  mail: [["rect", {
    width: 20,
    height: 16,
    x: 2,
    y: 4,
    rx: 2
  }], ["path", {
    d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
  }]],
  send: [["path", {
    d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
  }], ["path", {
    d: "m21.854 2.147-10.94 10.939"
  }]],
  instagram: [["rect", {
    width: 20,
    height: 20,
    x: 2,
    y: 2,
    rx: 5
  }], ["path", {
    d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
  }], ["path", {
    d: "M17.5 6.5h.01"
  }]],
  github: [["path", {
    d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
  }], ["path", {
    d: "M9 18c-4.51 2-5-2-7-2"
  }]],
  linkedin: [["path", {
    d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
  }], ["rect", {
    width: 4,
    height: 12,
    x: 2,
    y: 9
  }], ["circle", {
    cx: 4,
    cy: 4,
    r: 2
  }]],
  sun: [["circle", {
    cx: 12,
    cy: 12,
    r: 4
  }], ["path", {
    d: "M12 2v2"
  }], ["path", {
    d: "M12 20v2"
  }], ["path", {
    d: "m4.93 4.93 1.41 1.41"
  }], ["path", {
    d: "m17.66 17.66 1.41 1.41"
  }], ["path", {
    d: "M2 12h2"
  }], ["path", {
    d: "M20 12h2"
  }], ["path", {
    d: "m6.34 17.66-1.41 1.41"
  }], ["path", {
    d: "m19.07 4.93-1.41 1.41"
  }]],
  sparkles: [["path", {
    d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"
  }], ["path", {
    d: "M20 3v4"
  }], ["path", {
    d: "M22 5h-4"
  }], ["path", {
    d: "M4 17v2"
  }], ["path", {
    d: "M5 18H3"
  }]],
  loader: [["path", {
    d: "M12 2v4"
  }], ["path", {
    d: "m16.2 7.8 2.9-2.9"
  }], ["path", {
    d: "M18 12h4"
  }], ["path", {
    d: "m16.2 16.2 2.9 2.9"
  }], ["path", {
    d: "M12 18v4"
  }], ["path", {
    d: "m4.9 19.1 2.9-2.9"
  }], ["path", {
    d: "M2 12h4"
  }], ["path", {
    d: "m4.9 4.9 2.9 2.9"
  }]],
  "help-circle": [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
  }], ["path", {
    d: "M12 17h.01"
  }]]
};
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color,
  className,
  style,
  ...rest
}) {
  const parts = ICONS[name] || ICONS["help-circle"];
  return React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color || "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    style: {
      display: "inline-block",
      flexShrink: 0,
      verticalAlign: "middle",
      ...style
    },
    "aria-hidden": true,
    focusable: false,
    ...rest
  }, parts.map((p, i) => React.createElement(p[0], {
    key: i,
    ...p[1]
  })));
}

/** Names available in the bundled icon set. */
const iconNames = Object.keys(ICONS);

/** Capitalized alias so the name list is reachable via window.<Namespace> (only capitalized exports are exposed). */
const IconNames = Object.keys(ICONS);
Object.assign(__ds_scope, { Icon, iconNames, IconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/Icon.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  tabs = [],
  value,
  onChange,
  variant = "underline",
  fullWidth = false,
  style
}) {
  const [internal, setInternal] = React.useState(value ?? tabs[0]?.value);
  const active = value !== undefined ? value : internal;
  const select = v => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };
  const isPill = variant === "pill";
  const listStyle = isPill ? {
    display: "inline-flex",
    gap: 4,
    padding: 4,
    background: "var(--surface-sunken)",
    borderRadius: "var(--radius-pill)",
    ...(fullWidth ? {
      display: "flex",
      width: "100%"
    } : {})
  } : {
    display: "flex",
    gap: 4,
    borderBottom: "2px solid var(--border-default)",
    ...(fullWidth ? {
      width: "100%"
    } : {})
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      ...listStyle,
      ...style
    }
  }, tabs.map(t => {
    const on = t.value === active;
    const base = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      border: "none",
      cursor: "pointer",
      background: "transparent",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--text-base)",
      letterSpacing: "var(--tracking-wide)",
      flex: fullWidth ? 1 : "0 0 auto",
      transition: "color var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard)"
    };
    const look = isPill ? {
      padding: "8px 18px",
      borderRadius: "var(--radius-pill)",
      color: on ? "var(--text-on-brand)" : "var(--text-muted)",
      background: on ? "var(--brand-primary)" : "transparent"
    } : {
      padding: "12px 16px",
      marginBottom: -2,
      color: on ? "var(--brand-ink)" : "var(--text-muted)",
      borderBottom: `3px solid ${on ? "var(--brand-primary)" : "transparent"}`
    };
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => select(t.value),
      style: {
        ...base,
        ...look
      }
    }, t.icon ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex"
      }
    }, t.icon) : null, t.label, t.badge != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 20,
        padding: "0 6px",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-2xs)",
        fontWeight: "var(--fw-bold)",
        borderRadius: "var(--radius-pill)",
        background: on && isPill ? "rgba(255,248,236,0.25)" : "var(--sand-300)",
        color: on && isPill ? "var(--text-on-brand)" : "var(--espresso-700)"
      }
    }, t.badge) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }


Object.assign(__ds_ns, __ds_scope);
/* Recortado aqui: o resto do bundle era a compilação dos ui_kits, que o protótipo carrega à parte. Ver docs/design/README.md. */
})();
