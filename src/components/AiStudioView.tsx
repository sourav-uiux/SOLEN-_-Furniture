import React, { useState } from 'react';
import { Download, Film, Image as ImageIcon, Upload } from 'lucide-react';
import { IMAGES } from '../data/catalog';

const IMAGE_ASPECT_RATIOS = [
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '21:9',
] as const;

type ImageAspectRatio = (typeof IMAGE_ASPECT_RATIOS)[number];
type VideoAspectRatio = '16:9' | '9:16';

export const AiStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  // Bespoke Space Image Generator State (gemini-nano-banana-2.1)
  const [imagePrompt, setImagePrompt] = useState(
    'Sunlit minimalist architectural living room with a curved ivory bouclé sofa, honed travertine low coffee table, brushed brass arc floor lamp, and warm oak floor.'
  );
  const [imageRatio, setImageRatio] = useState<ImageAspectRatio>('16:9');
  const [imageQuality, setImageQuality] = useState<'1K' | '2K'>('1K');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ url: string; aspectRatio: string; prompt: string }>
  >([]);

  // Photo-to-Video Animator State (gemini-omni-1.2-flash)
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>('image/jpeg');
  const [videoPrompt, setVideoPrompt] = useState(
    'Slow architectural camera dolly forward as warm golden afternoon sunlight shifts gently across the upholstery and travertine surfaces.'
  );
  const [videoRatio, setVideoRatio] = useState<VideoAspectRatio>('16:9');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError(null);
    if (!imagePrompt.trim()) {
      setImageError('Please enter a spatial or furniture prompt.');
      return;
    }
    setImageLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageRatio,
          quality: imageQuality,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }
      setGeneratedImages((prev) => [
        { url: data.imageUrl, aspectRatio: data.aspectRatio, prompt: imagePrompt },
        ...prev,
      ]);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Unable to generate image.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleFileUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setVideoError('Please select a valid PNG, JPG, or WebP photograph.');
      return;
    }
    setVideoError(null);
    setUploadedMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setUploadedPreviewUrl(result);
      setUploadedBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const useShowroomSample = async (src: string) => {
    setVideoError(null);
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        setUploadedMime(blob.type || 'image/jpeg');
        setUploadedPreviewUrl(result);
        setUploadedBase64(result);
      };
      reader.readAsDataURL(blob);
    } catch {
      setVideoError('Could not load reference photograph.');
    }
  };

  const handleAnimateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError(null);
    if (!uploadedBase64) {
      setVideoError('Please upload a room or furniture photograph first.');
      return;
    }
    setVideoLoading(true);
    setGeneratedVideoUrl(null);
    try {
      const res = await fetch('/api/gemini/animate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataBase64: uploadedBase64,
          mimeType: uploadedMime,
          prompt: videoPrompt,
          aspectRatio: videoRatio,
          duration: '6s',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to animate photograph.');
      }
      setGeneratedVideoUrl(data.videoUrl);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Unable to animate photograph.');
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F4EF] pt-28 pb-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="border-b border-[#242421]/12 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-2">
              Solen Digital Atelier
            </p>
            <h1 className="font-editorial text-4xl md:text-6xl text-[#242421] font-normal">
              Architectural Visualization Studio
            </h1>
            <p className="text-sm text-[#242421]/75 mt-3 max-w-xl">
              Compose custom room renders at exact architectural aspect ratios, or animate any interior photograph into a moving showroom study.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border border-[#242421]/15 p-1 bg-[#EAE6DE]">
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.06em] uppercase cursor-pointer transition-colors ${
                activeTab === 'image'
                  ? 'bg-[#242421] text-[#F6F4EF]'
                  : 'text-[#242421] hover:bg-[#F6F4EF]/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Bespoke Space Render</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.06em] uppercase cursor-pointer transition-colors ${
                activeTab === 'video'
                  ? 'bg-[#242421] text-[#F6F4EF]'
                  : 'text-[#242421] hover:bg-[#F6F4EF]/60'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Animate Photo to Video</span>
            </button>
          </div>
        </div>

        {/* TAB 1: BESPOKE SPACE RENDER (Aspect Ratio Control) */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <form
              onSubmit={handleGenerateImage}
              className="lg:col-span-5 bg-[#EAE6DE]/65 border border-[#242421]/12 p-7 space-y-6"
            >
              <div>
                <label
                  htmlFor="studio-image-prompt"
                  className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2"
                >
                  Interior &amp; Material Direction
                </label>
                <textarea
                  id="studio-image-prompt"
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the architectural setting, upholstery material, and natural lighting..."
                  className="w-full p-3.5 bg-[#F6F4EF] border border-[#242421]/20 text-sm text-[#242421] focus:outline-none focus:border-[#242421]"
                />
              </div>

              <div>
                <span className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2.5">
                  Output Aspect Ratio
                </span>
                <div
                  className="grid grid-cols-4 gap-2"
                  role="radiogroup"
                  aria-label="Image aspect ratio"
                >
                  {IMAGE_ASPECT_RATIOS.map((ratio) => {
                    const active = imageRatio === ratio;
                    return (
                      <button
                        key={ratio}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setImageRatio(ratio)}
                        className={`py-2 text-xs tabular-nums border cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                            : 'bg-[#F6F4EF] text-[#242421] border-[#242421]/15 hover:border-[#242421]'
                        }`}
                      >
                        {ratio}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2">
                  Render Resolution
                </span>
                <div className="flex gap-2">
                  {(['1K', '2K'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setImageQuality(q)}
                      className={`px-4 py-2 text-xs border cursor-pointer ${
                        imageQuality === q
                          ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                          : 'bg-[#F6F4EF] text-[#242421] border-[#242421]/15'
                      }`}
                    >
                      {q} Studio
                    </button>
                  ))}
                </div>
              </div>

              {imageError && (
                <div
                  role="alert"
                  className="p-3.5 bg-[#FFFFFF] border border-[#A46952] text-xs text-[#242421]"
                >
                  {imageError}
                </div>
              )}

              <button
                type="submit"
                disabled={imageLoading}
                className="w-full py-3.5 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.12em] uppercase hover:bg-[#3A3A35] disabled:opacity-50 cursor-pointer"
              >
                {imageLoading ? 'Rendering Architectural Study...' : `Generate ${imageRatio} Render`}
              </button>
            </form>

            <div className="lg:col-span-7">
              {generatedImages.length === 0 ? (
                <div className="border border-[#242421]/12 bg-[#EAE6DE]/35 p-12 text-center h-full flex flex-col items-center justify-center min-h-[380px]">
                  <ImageIcon className="w-8 h-8 text-[#737767] mb-3" strokeWidth={1.3} />
                  <h2 className="font-editorial text-3xl text-[#242421]">
                    Architectural Canvas Ready
                  </h2>
                  <p className="text-sm text-[#737767] mt-2 max-w-md">
                    Select any framing ratio from 1:1 square lookbooks to 21:9 panoramic architectural elevations and generate your bespoke study.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {generatedImages.map((img, i) => (
                    <figure
                      key={i}
                      className="border border-[#242421]/12 bg-[#FFFFFF] p-4"
                    >
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full h-auto max-h-[540px] object-contain bg-[#EAE6DE]"
                      />
                      <figcaption className="mt-3 flex items-center justify-between gap-4 text-xs text-[#737767]">
                        <span>
                          Ratio {img.aspectRatio} · {img.prompt}
                        </span>
                        <a
                          href={img.url}
                          download={`solen-render-${img.aspectRatio.replace(':', 'x')}.png`}
                          className="inline-flex items-center gap-1 text-[#242421] underline shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PHOTO TO VIDEO ANIMATOR (gemini-omni-1.2-flash) */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <form
              onSubmit={handleAnimateVideo}
              className="lg:col-span-5 bg-[#EAE6DE]/65 border border-[#242421]/12 p-7 space-y-6"
            >
              <div>
                <span className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2">
                  1. Upload Starting Photograph
                </span>
                <label
                  htmlFor="video-photo-upload"
                  className="flex flex-col items-center justify-center border border-dashed border-[#242421]/30 bg-[#F6F4EF] p-6 text-center cursor-pointer hover:border-[#242421] transition-colors"
                >
                  <Upload className="w-5 h-5 text-[#737767] mb-2" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-[#242421]">
                    Choose room or furniture photograph
                  </span>
                  <span className="text-[11px] text-[#737767] mt-1">
                    JPG, PNG, or WebP
                  </span>
                  <input
                    id="video-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="sr-only"
                  />
                </label>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#737767]">
                  <span>Or test with showroom scene:</span>
                  <button
                    type="button"
                    onClick={() => useShowroomSample(IMAGES.heroLiving)}
                    className="underline text-[#242421] cursor-pointer"
                  >
                    Living Salon
                  </button>
                  <button
                    type="button"
                    onClick={() => useShowroomSample(IMAGES.aurelSofa)}
                    className="underline text-[#242421] cursor-pointer"
                  >
                    AUREL Sofa
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2">
                  2. Film Aspect Ratio
                </span>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Video aspect ratio">
                  {(['16:9', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      role="radio"
                      aria-checked={videoRatio === ratio}
                      onClick={() => setVideoRatio(ratio)}
                      className={`py-2.5 text-xs border cursor-pointer transition-colors ${
                        videoRatio === ratio
                          ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                          : 'bg-[#F6F4EF] text-[#242421] border-[#242421]/15'
                      }`}
                    >
                      {ratio === '16:9' ? '16:9 Landscape' : '9:16 Portrait'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="video-motion-prompt"
                  className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2"
                >
                  3. Camera &amp; Daylight Motion
                </label>
                <textarea
                  id="video-motion-prompt"
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full p-3.5 bg-[#F6F4EF] border border-[#242421]/20 text-sm text-[#242421] focus:outline-none focus:border-[#242421]"
                />
              </div>

              {videoError && (
                <div
                  role="alert"
                  className="p-3.5 bg-[#FFFFFF] border border-[#A46952] text-xs text-[#242421]"
                >
                  {videoError}
                </div>
              )}

              <button
                type="submit"
                disabled={videoLoading}
                className="w-full py-3.5 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.12em] uppercase hover:bg-[#3A3A35] disabled:opacity-50 cursor-pointer"
              >
                {videoLoading
                  ? 'Synthesizing Architectural Film...'
                  : `Animate into ${videoRatio} Video`}
              </button>
            </form>

            <div className="lg:col-span-7">
              <div className="border border-[#242421]/12 bg-[#EAE6DE]/35 p-6 min-h-[420px] flex flex-col justify-center items-center">
                {generatedVideoUrl ? (
                  <div className="w-full space-y-4">
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full max-h-[500px] bg-[#242421]"
                    />
                    <div className="flex items-center justify-between text-xs text-[#737767]">
                      <span>Generated showroom film ({videoRatio})</span>
                      <a
                        href={generatedVideoUrl}
                        download={`solen-film-${videoRatio.replace(':', 'x')}.mp4`}
                        className="inline-flex items-center gap-1 text-[#242421] underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP4</span>
                      </a>
                    </div>
                  </div>
                ) : uploadedPreviewUrl ? (
                  <div className="w-full space-y-3 text-center">
                    <img
                      src={uploadedPreviewUrl}
                      alt="Uploaded starting frame"
                      className="w-full max-h-[420px] object-contain mx-auto"
                    />
                    <p className="text-xs text-[#737767]">
                      Starting frame ready · Select {videoRatio} and click Animate to generate motion.
                    </p>
                  </div>
                ) : (
                  <div className="text-center max-w-md py-12">
                    <Film className="w-8 h-8 text-[#737767] mx-auto mb-3" strokeWidth={1.3} />
                    <h2 className="font-editorial text-3xl text-[#242421]">
                      Photo-to-Film Motion Stage
                    </h2>
                    <p className="text-sm text-[#737767] mt-2">
                      Upload any interior photograph or select a showroom reference frame to produce a 16:9 or 9:16 architectural film.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
