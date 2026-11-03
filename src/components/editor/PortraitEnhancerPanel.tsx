"use client";

import React from "react";
import { useEditor } from "@/lib/context/EditorContext";
import { EnhancementPreset } from "@/types/editor";
import {
  Sparkles,
  Sliders,
  Sun,
  Contrast,
  Palette,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Wand2,
  Zap,
  Activity,
  Layers,
  Check,
  Info,
} from "lucide-react";

export function PortraitEnhancerPanel() {
  const {
    enhancementState,
    updateEnhancementSettings,
    applyEnhancementPreset,
    toggleEnhancement,
    toggleEnhancementCompare,
    resetEnhancement,
  } = useEditor();

  const { settings, isProcessing, compareMode } = enhancementState;

  const presets: { id: EnhancementPreset; name: string; desc: string; icon: string }[] = [
    { id: "natural", name: "ICAO Natural", desc: "Subtle & standard compliant", icon: "🌱" },
    { id: "studio", name: "Studio Light", desc: "Professional soft lighting", icon: "💡" },
    { id: "brighten", name: "Brighten Glow", desc: "Shadow lift & glow", icon: "✨" },
    { id: "subtle", name: "Ultra Subtle", desc: "Minimal edge touchup", icon: "🎯" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Main Enhancement Master Header ─────────────────────────── */}
      <div className="bg-[#171B24] border border-[#292F3A] rounded-2xl p-4 text-[#F5F7FA] shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A]">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-[#F5F7FA]">
                <span>AI Portrait Enhancement</span>
                {settings.enabled && (
                  <span className="text-[10px] bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 font-black px-1.5 py-0.2 rounded-full">
                    ACTIVE
                  </span>
                )}
              </h4>
              <span className="text-[10px] text-[#9CA3AF]">Identity-Preserving Engine · Zero-Cost</span>
            </div>
          </div>

          {/* Master Toggle Switch */}
          <button
            type="button"
            onClick={() => toggleEnhancement()}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-[#292F3A] transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.enabled ? "bg-[#8B7CFF]" : "bg-[#1C2230]"
            }`}
            title={settings.enabled ? "Turn Off Enhancement" : "Turn On Enhancement"}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF] leading-relaxed mb-3">
          Enhance skin texture, balance portrait lighting, sharpen eyes, and reduce high-ISO noise
          while strictly retaining natural facial contours and ICAO biometric validity.
        </p>

        {/* Quick Comparison Toggle Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleEnhancementCompare()}
            disabled={!settings.enabled}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              compareMode
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-[#1C2230] hover:bg-[#292F3A] border border-[#292F3A] text-[#F5F7FA]"
            }`}
          >
            {compareMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{compareMode ? "Showing Original" : "Compare Before/After"}</span>
          </button>

          <button
            type="button"
            onClick={resetEnhancement}
            className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#292F3A] border border-[#292F3A] text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors"
            title="Reset enhancement settings"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Processing Indicator ───────────────────────────────────── */}
      {isProcessing && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#171B24] border border-[#8B7CFF]/40 rounded-xl text-xs text-[#8B7CFF] animate-pulse">
          <Activity className="w-3.5 h-3.5 animate-spin" />
          <span>Refining portrait details in browser memory…</span>
        </div>
      )}

      {/* ── Presets Grid ───────────────────────────────────────────── */}
      <div>
        <label className="text-xs font-bold text-[#F5F7FA] block mb-2 flex items-center justify-between">
          <span>1-Click Enhancement Presets</span>
          <span className="text-[10px] text-[#697386] font-normal">Click to apply profile</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => {
            const isSelected = settings.enabled && settings.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyEnhancementPreset(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "border-[#8B7CFF] bg-[#1C2230] shadow-xs ring-1 ring-[#8B7CFF]/30"
                    : "border-[#292F3A] bg-[#171B24] hover:border-[#292F3A]/80 hover:bg-[#1C2230]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{p.icon}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#8B7CFF] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#F5F7FA] leading-tight">{p.name}</p>
                <p className="text-[10px] text-[#9CA3AF] leading-tight mt-0.5">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Detailed Enhancement Sliders ───────────────────────────── */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between border-b border-[#292F3A] pb-2">
          <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            Fine-Tuning Controls
          </span>
          <span className="text-[10px] text-[#697386]">
            {settings.enabled ? "Customized" : "Turn on above to activate"}
          </span>
        </div>

        {/* 1. Skin Retouching */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF] font-medium flex items-center gap-1.5">
              <span>Skin Retouching</span>
            </span>
            <span className="font-mono font-bold text-[#8B7CFF]">{settings.skinSmoothing}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.skinSmoothing}
            disabled={!settings.enabled}
            onChange={(e) => updateEnhancementSettings({ skinSmoothing: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
          />
          <p className="text-[10px] text-[#697386]">Softens uneven tones while keeping natural skin pores.</p>
        </div>

        {/* 2. Blemish Reduction */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF] font-medium">Blemish Reduction</span>
            <span className="font-mono font-bold text-[#8B7CFF]">{settings.blemishReduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.blemishReduction}
            disabled={!settings.enabled}
            onChange={(e) => updateEnhancementSettings({ blemishReduction: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
          />
          <p className="text-[10px] text-[#697386]">Diminishes temporary spots & redness on facial areas.</p>
        </div>

        {/* 3. Lighting Correction */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF] font-medium">Lighting Correction (Shadows Lift)</span>
            <span className="font-mono font-bold text-[#8B7CFF]">{settings.lightingCorrection}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.lightingCorrection}
            disabled={!settings.enabled}
            onChange={(e) => updateEnhancementSettings({ lightingCorrection: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
          />
          <p className="text-[10px] text-[#697386]">Balances uneven shadows under chin and eye sockets.</p>
        </div>

        {/* 4. Sharpness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF] font-medium">Eye & Hair Sharpness</span>
            <span className="font-mono font-bold text-[#8B7CFF]">{settings.sharpness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sharpness}
            disabled={!settings.enabled}
            onChange={(e) => updateEnhancementSettings({ sharpness: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
          />
          <p className="text-[10px] text-[#697386]">Unsharp mask sharpening for eyes, iris, and hair edges.</p>
        </div>

        {/* 5. Noise Reduction */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF] font-medium">Noise Reduction</span>
            <span className="font-mono font-bold text-[#8B7CFF]">{settings.noiseReduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.noiseReduction}
            disabled={!settings.enabled}
            onChange={(e) => updateEnhancementSettings({ noiseReduction: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
          />
          <p className="text-[10px] text-[#697386]">Cleans low-light sensor grain and JPEG compression artifacts.</p>
        </div>

        {/* 6. Colour Correction (Temperature) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF] font-medium">Colour Temperature</span>
            <span className="font-mono font-bold text-[#8B7CFF]">
              {settings.colorCorrection > 0 ? `+${settings.colorCorrection} Warm` : settings.colorCorrection < 0 ? `${settings.colorCorrection} Cool` : "Neutral"}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={settings.colorCorrection}
            disabled={!settings.enabled}
            onChange={(e) => updateEnhancementSettings({ colorCorrection: Number(e.target.value) })}
            className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] text-[#697386]">
            <span>Cool (Fluorescent fix)</span>
            <span>Warm (Natural sun)</span>
          </div>
        </div>

        {/* 7. Brightness & Contrast */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#9CA3AF] flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Brightness</span>
              </span>
              <span className="font-mono font-bold text-[#F5F7FA]">
                {settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={settings.brightness}
              disabled={!settings.enabled}
              onChange={(e) => updateEnhancementSettings({ brightness: Number(e.target.value) })}
              className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#9CA3AF] flex items-center gap-1">
                <Contrast className="w-3 h-3 text-[#8B7CFF]" />
                <span>Contrast</span>
              </span>
              <span className="font-mono font-bold text-[#F5F7FA]">
                {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={settings.contrast}
              disabled={!settings.enabled}
              onChange={(e) => updateEnhancementSettings({ contrast: Number(e.target.value) })}
              className="w-full accent-[#8B7CFF] cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* 8. 300 DPI Detail Reconstruction Switch */}
        <div className="p-3 bg-[#171B24] border border-[#292F3A] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-[#F5F7FA]">300 DPI Detail Reconstruction</p>
              <p className="text-[10px] text-[#697386]">Sub-pixel Lanczos3 supersampling on export</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              updateEnhancementSettings({ superResolution: !settings.superResolution })
            }
            className={`w-9 h-5 rounded-full transition-colors relative border border-[#292F3A] ${
              settings.superResolution ? "bg-[#8B7CFF]" : "bg-[#1C2230]"
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                settings.superResolution ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Compliance Guarantee Notice */}
        <div className="flex items-start gap-2 p-2.5 bg-[#34D399]/15 border border-[#34D399]/30 rounded-xl text-[#34D399] text-[11px] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
          <span>
            <strong>ICAO Doc 9303 Compliant:</strong> Our edge-preserving engine retains your true facial
            features, birthmarks, and eye color intact so your passport photo will not be rejected.
          </span>
        </div>
      </div>
    </div>
  );
}

