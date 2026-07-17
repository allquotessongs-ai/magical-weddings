import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { themeRegistry } from "@/components/wedding/themes/registry";
import { demoWedding } from "@/features/weddings/demo";
import { FALLBACK_THEME_ID, getThemeDefinition, resolveTheme, themeDefinitions, validateThemeContrast } from "@/features/themes/registry";
import { THEME_IDS, type ThemeOverrideMap, type ThemePageProps } from "@/features/themes/types";
import { themeSettingsSchema } from "@/lib/validation/wedding";

const props: ThemePageProps = { wedding: demoWedding, sections: demoWedding.sections, countdown: { days: 1, hours: 2, minutes: 3, seconds: 4 }, shareText: "invited" };

describe("theme registry", () => {
  it("contains four stable themes and uses Timeless Romance as its fallback", () => {
    expect(themeDefinitions.map((theme) => theme.id)).toEqual(THEME_IDS);
    expect(getThemeDefinition("not-a-theme").id).toBe(FALLBACK_THEME_ID);
  });

  it("keeps overrides isolated per theme", () => {
    const overrides: ThemeOverrideMap = { "timeless-romance": { accent: "#663344" }, "modern-minimal": { accent: "#225588" } };
    expect(resolveTheme("timeless-romance", overrides).accent).toBe("#663344");
    expect(resolveTheme("modern-minimal", overrides).accent).toBe("#225588");
    expect(resolveTheme("tropical-elegance", overrides).accent).toBe(getThemeDefinition("tropical-elegance").defaults.accent);
  });

  it("ignores customizations when the package does not allow them", () => {
    expect(resolveTheme("modern-minimal", { "modern-minimal": { accent: "#225588" } }, false).accent).toBe(getThemeDefinition("modern-minimal").defaults.accent);
  });

  it("rejects an unreadable administrator palette", () => {
    const invalid = { ...getThemeDefinition("timeless-romance").defaults, themeId: "timeless-romance", text: "#ffffff", background: "#fffafa" };
    expect(validateThemeContrast(invalid)).toMatch(/4.5:1/);
    expect(() => themeSettingsSchema.parse(invalid)).toThrow();
  });

  it("renders distinct identifying markup from the same wedding object", () => {
    const markup = THEME_IDS.map((id) => {
      const Component = themeRegistry[id].component;
      const wedding = { ...demoWedding, theme: resolveTheme(id) };
      return renderToStaticMarkup(React.createElement(Component, { ...props, wedding }));
    });
    THEME_IDS.forEach((id, index) => expect(markup[index]).toContain(`data-theme-renderer="${id}"`));
    expect(new Set(markup).size).toBe(4);
    expect(demoWedding.content.coupleStory).toBe(props.wedding.content.coupleStory);
  });

  it("respects section visibility and ordering in every renderer", () => {
    for (const id of THEME_IDS) {
      const Component = themeRegistry[id].component;
      const wedding = { ...demoWedding, theme: resolveTheme(id) };
      const sections = demoWedding.sections.filter((section) => ["story", "welcome"].includes(section.key)).map((section) => ({ ...section, position: section.key === "story" ? 0 : 1 }));
      const markup = renderToStaticMarkup(React.createElement(Component, { ...props, wedding, sections }));
      expect(markup.indexOf('id="story"')).toBeLessThan(markup.indexOf('id="welcome"'));
      expect(markup).not.toContain('id="ceremony"');
    }
  });
});
