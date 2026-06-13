"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { BackgroundType } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media-config";
import { DEFAULT_MEDIA_FOCUS, type MediaFocus } from "@/lib/media-focus";
import { getMediaSrc } from "@/lib/media-url";
import {
  registerProfileBackgroundVideo,
  setBackgroundVideoAwaitEntryGate,
  startBackgroundVideoFromEnter,
  startBackgroundVideoMutedFromEnter,
} from "@/lib/profile-background-video-audio";
import { FocusedImage, FocusedVideo } from "@/components/FocusedMedia";

interface Props {
  url: string;
  type: BackgroundType;
  contained?: boolean;
  focus?: MediaFocus;
  /** El audio del perfil sale del mismo video (sin segundo reproductor). */
  videoAudioEnabled?: boolean;
  /** true = no reproducir hasta el gesto de entrada. */
  deferPlayback?: boolean;
}

const FALLBACK_CLASS =
  "bg-gradient-to-br from-[#1a1033] via-[#0a0a0f] to-[#1e1b4b]";

export default function BackgroundMedia({
  url,
  type,
  contained = false,
  focus,
  videoAudioEnabled = false,
  deferPlayback = false,
}: Props) {
  const [broken, setBroken] = useState(false);
  const [useBackgroundCss, setUseBackgroundCss] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const shellClass = contained
    ? "absolute inset-0 overflow-hidden"
    : "fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden";
  const pointerClass = "pointer-events-none";
  const mediaType = resolveBackgroundType(url, type);
  const displayUrl = getMediaSrc(url);
  const mediaFocus =
    mediaType === "video" ? DEFAULT_MEDIA_FOCUS : (focus ?? DEFAULT_MEDIA_FOCUS);

  useEffect(() => {
    setBroken(false);
    setUseBackgroundCss(false);
    setLoaded(false);
    setVideoElement(null);
  }, [url, type]);

  useLayoutEffect(() => {
    if (mediaType !== "video") return;
    setBackgroundVideoAwaitEntryGate(deferPlayback);
  }, [deferPlayback, mediaType]);

  useEffect(() => {
    if (mediaType !== "video" || !videoElement) return;
    return registerProfileBackgroundVideo(videoElement, { audioFromVideo: videoAudioEnabled });
  }, [mediaType, videoElement, displayUrl, videoAudioEnabled]);

  useEffect(() => {
    if (!videoElement || mediaType !== "video" || deferPlayback) return;

    if (videoAudioEnabled) {
      startBackgroundVideoFromEnter();
      return;
    }

    startBackgroundVideoMutedFromEnter();
  }, [deferPlayback, videoElement, mediaType, videoAudioEnabled]);

  useEffect(() => {
    if (!videoElement || mediaType !== "video") return;

    const markReady = () => setLoaded(true);
    if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
      markReady();
    }
    videoElement.addEventListener("loadedmetadata", markReady);
    videoElement.addEventListener("loadeddata", markReady);

    if (videoElement.readyState === HTMLMediaElement.HAVE_NOTHING) {
      videoElement.load();
    }

    return () => {
      videoElement.removeEventListener("loadedmetadata", markReady);
      videoElement.removeEventListener("loadeddata", markReady);
    };
  }, [videoElement, mediaType, displayUrl]);

  useEffect(() => {
    if (mediaType === "video" || !displayUrl?.trim()) return;

    const img = new Image();
    const markLoaded = () => setLoaded(true);
    img.onload = markLoaded;
    img.onerror = () => setUseBackgroundCss(true);
    img.src = displayUrl;
    if (img.complete && img.naturalWidth > 0) markLoaded();

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [displayUrl, mediaType]);

  if (!url?.trim() || broken) {
    return (
      <div
        className={`${shellClass} ${FALLBACK_CLASS} ${pointerClass}`}
        aria-hidden="true"
      />
    );
  }

  const mediaFadeClass = `transition-opacity duration-500 ease-out ${
    loaded ? "opacity-100" : "opacity-0"
  }`;

  if (mediaType === "video") {
    return (
      <div className={`${shellClass} ${pointerClass}`} aria-hidden="true">
        <div className={`absolute inset-0 ${FALLBACK_CLASS}`} />
        <div className={`absolute inset-0 ${mediaFadeClass}`}>
          <FocusedVideo
            src={displayUrl}
            priority
            autoPlay={false}
            muted
            videoRef={setVideoElement}
            wrapperClassName="absolute inset-0"
            onReady={() => setLoaded(true)}
            onError={() => setBroken(true)}
          />
        </div>
      </div>
    );
  }

  if (useBackgroundCss) {
    return (
      <div className={`${shellClass} ${pointerClass}`} aria-hidden="true">
        <div className={`absolute inset-0 ${FALLBACK_CLASS}`} />
        <div
          className={`absolute inset-0 ${mediaFadeClass}`}
          style={{
            backgroundImage: `url("${displayUrl}")`,
            backgroundSize: `${mediaFocus.zoom * 100}%`,
            backgroundPosition: `${mediaFocus.x}% ${mediaFocus.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${shellClass} ${pointerClass}`} aria-hidden="true">
      <div className={`absolute inset-0 ${FALLBACK_CLASS}`} />
      <div className={`absolute inset-0 ${mediaFadeClass}`}>
        <FocusedImage
          src={displayUrl}
          alt=""
          focus={mediaFocus}
          priority
          wrapperClassName="absolute inset-0"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!useBackgroundCss) {
              setUseBackgroundCss(true);
              return;
            }
            setBroken(true);
          }}
        />
      </div>
    </div>
  );
}
