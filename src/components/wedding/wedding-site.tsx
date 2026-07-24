"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Music2, Pause, Volume1, VolumeX } from "lucide-react";
import { RegisteredThemePage } from "@/components/wedding/themes/registry";
import { mediaUrl } from "@/components/wedding/themes/shared";
import { readableForeground } from "@/features/themes/registry";
import type { WeddingSite } from "@/features/weddings/types";
import { sectionEntitlement } from "@/features/entitlements";
import { formatWeddingDate } from "@/lib/utils";

const fontMap: Record<string, string> = { "Cormorant Garamond": "var(--font-cormorant)", "Playfair Display": "var(--font-playfair)", "DM Serif Display": "var(--font-dm-serif)", Manrope: "var(--font-manrope)", Inter: "var(--font-inter)", Lora: "var(--font-lora)" };
function useCountdown(target: string) { const [now, setNow] = useState(0); useEffect(() => { const tick = () => setNow(Date.now()); const immediate = setTimeout(tick, 0); const timer = setInterval(tick, 1000); return () => { clearTimeout(immediate); clearInterval(timer); }; }, []); const remaining = now === 0 ? 0 : Math.max(0, new Date(target).getTime() - now); return { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60 }; }

export function WeddingSiteRenderer({ wedding, preview = false }: { wedding: WeddingSite; preview?: boolean }) {
  const sections = useMemo(() => wedding.sections.filter((section) => section.enabled && sectionEntitlement(section.key, wedding.entitlements)).sort((a, b) => a.position - b.position), [wedding]);
  const openingEnabled = sections.some((section) => section.key === "opening");
  const [opened, setOpened] = useState(preview || !openingEnabled);
  const [playing, setPlaying] = useState(false); const [volume, setVolume] = useState(0.55); const [volumeOpen, setVolumeOpen] = useState(false); const audioRef = useRef<HTMLAudioElement>(null); const countdown = useCountdown(wedding.weddingAt);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  const texture = mediaUrl(wedding.media.texture);
  const css = { "--w-primary": wedding.theme.primary, "--w-secondary": wedding.theme.secondary, "--w-accent": wedding.theme.accent, "--w-background": wedding.theme.background, "--w-text": wedding.theme.text, "--w-heading": fontMap[wedding.theme.headingFont], "--w-body": fontMap[wedding.theme.bodyFont], "--w-decorative": fontMap[wedding.theme.decorativeFont], "--w-on-primary": readableForeground(wedding.theme.primary), "--w-on-accent": readableForeground(wedding.theme.accent), "--w-texture-image": texture ? `url("${texture}")` : "none" } as React.CSSProperties;
  const hero = mediaUrl(wedding.media.hero); const focal = wedding.mediaFocalPoints.hero ?? { x: 50, y: 22 };
  async function openInvitation() { setOpened(true); if (wedding.media.music && wedding.entitlements.backgroundMusic && audioRef.current) { try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); } } }
  function toggleMusic() { if (!audioRef.current) return; if (audioRef.current.paused) { void audioRef.current.play(); setPlaying(true); } else { audioRef.current.pause(); setPlaying(false); } }
  const publicUrl = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")}/${wedding.slug}`;
  const shareText = encodeURIComponent(`You’re invited to celebrate ${wedding.displayNames} on ${formatWeddingDate(wedding.weddingAt, wedding.timezone)}. ${publicUrl}`);
  return <div className={`wedding-site theme-${wedding.theme.id} radius-${wedding.theme.radius} shadow-${wedding.theme.shadow} spacing-${wedding.theme.sectionSpacing} motion-${wedding.theme.motion} images-${wedding.theme.imageTreatment} buttons-${wedding.theme.buttonStyle} ${texture ? "has-texture" : ""}`} style={css} data-opened={opened} data-theme={wedding.theme.id}>
    {wedding.media.music && <audio ref={audioRef} src={mediaUrl(wedding.media.music)} loop muted={volume === 0} />}
    {!opened && <div className={`invitation-gate gate-${wedding.theme.id}`}>{hero && <Image src={hero} alt="" fill priority sizes="100vw" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} unoptimized />}<div className="gate-overlay" /><div className="gate-decoration" aria-hidden="true" /><div className="gate-content"><p>Together with their families</p><h1>{wedding.displayNames}</h1><span>{formatWeddingDate(wedding.weddingAt, wedding.timezone)}</span><button onClick={openInvitation}>Open invitation <ChevronDown /></button></div></div>}
    <RegisteredThemePage wedding={wedding} sections={sections} countdown={countdown} shareText={shareText} />
    {wedding.media.music && wedding.entitlements.backgroundMusic && opened && <div className="audio-controls" aria-label="Wedding music controls" onKeyDown={(event) => { if (event.key === "Escape") setVolumeOpen(false); }}><button aria-label={playing ? "Pause music" : "Play music"} onClick={toggleMusic}>{playing ? <Pause /> : <Music2 />}</button><button aria-label={volume === 0 ? "Adjust music volume (muted)" : "Adjust music volume"} aria-controls="wedding-music-volume" aria-expanded={volumeOpen} onClick={() => setVolumeOpen((value) => !value)}>{volume === 0 ? <VolumeX /> : <Volume1 />}</button>{volumeOpen && <label id="wedding-music-volume" className="audio-volume-popover"><span className="sr-only">Music volume</span><input aria-label="Music volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>}</div>}
  </div>;
}
