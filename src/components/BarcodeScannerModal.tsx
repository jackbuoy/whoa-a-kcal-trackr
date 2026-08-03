import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import { fetchFoodByBarcode } from "../utils/openFoodFactsUtils";
import type { Food } from "../types/food";

interface Props {
    onClose: () => void;
    onFoodFound: (food: Food) => void;
}

// frequency (in ms) to run native BarcodeDetector.detect() against video frame
// keeps main thread free for UI interactions like button taps
const NATIVE_DETECT_INTERVAL_MS = 150;
// frequency (in ms) to retry when video element isn't ready
const NATIVE_DETECT_RETRY_MS = 100;

export function BarcodeScannerModal({ onClose, onFoodFound }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cameraErrorDetail, setCameraErrorDetail] = useState<string | null>(null);
    const [manualBarcode, setManualBarcode] = useState("");
    const [isManualInputOpen, setIsManualInputOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [hasZoom, setHasZoom] = useState(false);
    const [zoomMax, setZoomMax] = useState(2);
    // tracks whether the video element has settled at its final negotiated resolution
    // used to fade the feed in only once it's stable
    const [isVideoReady, setIsVideoReady] = useState(false);

    // kept as refs (not state) purely so isLoading/scanSuccess checks inside the
    // detection loop always read the latest value without re-subscribing effects
    const isLoadingRef = useRef(isLoading);
    const scanSuccessRef = useRef(scanSuccess);
    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);
    useEffect(() => {
        scanSuccessRef.current = scanSuccess;
    }, [scanSuccess]);

    const stopAllStreams = useCallback(() => {
        if (readerRef.current) {
            try {
                readerRef.current.reset();
            } catch (e) {
                console.warn("Error resetting ZXing reader:", e);
            }
        }
        if (mediaStreamRef.current) {
            // WebKit quirk: on some iOS Safari versions, if torch was ever turned on for a track
            // stop() alone can fail to fully release the camera (recording indicator stays lit)
            // explicitly turning torch off first is cheap and avoids that class of bug
            // best-effort - some tracks won't support it, hence the catch
            mediaStreamRef.current.getVideoTracks().forEach((track) => {
                try {
                    const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
                    if (capabilities.torch) {
                        track.applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet] }).catch(() => { });
                    }
                } catch (e) {
                    // ignore — best effort only
                }
            });
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
        // explicitly detach the stream from the <video> element (on iOS Safari in particular)
        // leaving srcObject pointing at a (now-stopped) stream keeps
        // the hardware decode pipeline reserved longer than it needs to be
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsVideoReady(false);
    }, []);

    const handleBarcodeDetected = useCallback(async (barcode: string) => {
        if (isLoadingRef.current || scanSuccessRef.current) return;

        // visual feedback (guidelines turn emerald green)
        setScanSuccess(true);
        setIsLoading(true);
        setErrorMessage(null);

        // pause briefly for green success pulse animation
        await new Promise((resolve) => setTimeout(resolve, 350));

        stopAllStreams();

        const food = await fetchFoodByBarcode(barcode);
        setIsLoading(false);

        if (food) {
            onFoodFound(food);
            onClose();
        } else {
            setScanSuccess(false);
            setErrorMessage(`No product found on OpenFoodFacts for barcode: ${barcode}`);
        }
    }, [onClose, onFoodFound, stopAllStreams]);

    // The camera-init effect below intentionally does NOT depend on
    // handleBarcodeDetected directly. handleBarcodeDetected's identity changes
    // whenever onClose/onFoodFound change. We stash the latest version in a ref and
    // read from the ref inside the effect, so the effect only runs once on mount.
    const handleBarcodeDetectedRef = useRef(handleBarcodeDetected);
    useEffect(() => {
        handleBarcodeDetectedRef.current = handleBarcodeDetected;
    }, [handleBarcodeDetected]);

    // toggle torch/flashlight
    const toggleTorch = useCallback(async () => {
        if (!mediaStreamRef.current) return;
        const track = mediaStreamRef.current.getVideoTracks()[0];
        if (!track) return;

        try {
            const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
            if (capabilities.torch) {
                setTorchOn((prev) => {
                    const nextState = !prev;
                    track.applyConstraints({
                        advanced: [{ torch: nextState } as MediaTrackConstraintSet],
                    }).catch((e) => console.warn("Failed to toggle torch:", e));
                    return nextState;
                });
            }
        } catch (e) {
            console.warn("Failed to toggle torch:", e);
        }
    }, []);

    // toggle camera zoom (1x / 2x for small barcodes)
    const toggleZoom = useCallback(async () => {
        if (!mediaStreamRef.current) return;
        const track = mediaStreamRef.current.getVideoTracks()[0];
        if (!track) return;

        try {
            setZoomLevel((prev) => {
                const nextZoom = prev === 1 ? Math.min(2, zoomMax) : 1;
                track.applyConstraints({
                    advanced: [{ zoom: nextZoom } as MediaTrackConstraintSet],
                }).catch((e) => console.warn("Failed to toggle zoom:", e));
                return nextZoom;
            });
        } catch (e) {
            console.warn("Failed to toggle zoom:", e);
        }
    }, [zoomMax]);

    // initialize scanner: prefer the native BarcodeDetector (Vision-backed on iOS
    // Safari 17+) and only fall back to the ZXing JS decoder when it's unavailable
    useEffect(() => {
        let isMounted = true;
        let nativeLoopTimer: ReturnType<typeof setTimeout> | null = null;

        const applyStreamCapabilities = (stream: MediaStream) => {
            mediaStreamRef.current = stream;
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack && videoTrack.getCapabilities) {
                const caps = videoTrack.getCapabilities() as { torch?: boolean; zoom?: { min: number; max: number } };
                setHasTorch(!!caps.torch);
                if (caps.zoom) {
                    setHasZoom(true);
                    setZoomMax(caps.zoom.max || 2);
                }
            }
        };

        const startNativeScanner = async (BarcodeDetectorClass: new (opts?: { formats: string[] }) => {
            detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
        }) => {
            if (!videoRef.current) return;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            if (!isMounted) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            videoRef.current.srcObject = stream;
            applyStreamCapabilities(stream);
            setHasCameraPermission(true);

            const nativeDetector = new BarcodeDetectorClass({
                formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
            });

            const processNativeFrame = async () => {
                if (!isMounted) return;

                if (!videoRef.current || videoRef.current.readyState < 2) {
                    nativeLoopTimer = setTimeout(processNativeFrame, NATIVE_DETECT_RETRY_MS);
                    return;
                }

                try {
                    const barcodes = await nativeDetector.detect(videoRef.current);
                    if (isMounted && barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                        handleBarcodeDetectedRef.current(barcodes[0].rawValue);
                        return; // stop looping once we hand off to handleBarcodeDetected
                    }
                } catch (e) {
                    // ignore frame detection errors
                }

                if (isMounted) {
                    nativeLoopTimer = setTimeout(processNativeFrame, NATIVE_DETECT_INTERVAL_MS);
                }
            };

            processNativeFrame();
        };

        const startZxingScanner = async () => {
            if (!videoRef.current) return;

            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39,
                BarcodeFormat.ITF,
                BarcodeFormat.QR_CODE,
            ]);
            hints.set(DecodeHintType.TRY_HARDER, true);

            const zxingReader = new BrowserMultiFormatReader(hints);
            readerRef.current = zxingReader;

            await zxingReader.decodeFromConstraints(
                {
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                },
                videoRef.current,
                (result) => {
                    if (isMounted && result && result.getText()) {
                        handleBarcodeDetectedRef.current(result.getText());
                    }
                }
            );

            if (!isMounted) {
                // the reader already attached a live stream to the video element by
                // this point, if it hasn't, stop it here
                const staleStream = videoRef.current.srcObject as MediaStream | null;
                staleStream?.getTracks().forEach((track) => track.stop());
                if (videoRef.current) videoRef.current.srcObject = null;
                return;
            }

            const stream = videoRef.current.srcObject as MediaStream | null;
            setHasCameraPermission(true);
            if (stream) applyStreamCapabilities(stream);
        };

        const startScanner = async () => {
            // defensive: if anything from a previous init attempt is still holding
            // a stream, kill it before asking for a new one
            stopAllStreams();
            setCameraErrorDetail(null);

            const isSecure =
                window.isSecureContext ||
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";
            const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

            if (!isSecure && !hasMediaDevices) {
                if (isMounted) {
                    setCameraErrorDetail("iOS Safari requires HTTPS for camera access on local network IPs.");
                    setHasCameraPermission(false);
                }
                return;
            }

            if (!videoRef.current) return;

            try {
                const BarcodeDetectorClass = (
                    window as unknown as {
                        BarcodeDetector?: new (opts?: { formats: string[] }) => {
                            detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
                        };
                    }
                ).BarcodeDetector;

                if (BarcodeDetectorClass) {
                    // native path: apple vision on ios safari 17+, also recent chrome/android
                    await startNativeScanner(BarcodeDetectorClass);
                } else {
                    // fallback for browsers without native barcode detector support
                    await startZxingScanner();
                }
            } catch (err: unknown) {
                const errStr = err instanceof Error ? err.message : String(err);
                console.warn("Camera init failed:", err);
                if (isMounted) {
                    setCameraErrorDetail(errStr);
                    setHasCameraPermission(false);
                }
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (nativeLoopTimer !== null) clearTimeout(nativeLoopTimer);
            stopAllStreams();
        };
    }, [stopAllStreams]);

    const handleManualSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (manualBarcode.trim()) {
            setIsManualInputOpen(false);
            handleBarcodeDetected(manualBarcode.trim());
        }
    }, [manualBarcode, handleBarcodeDetected]);

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-50 bg-app-bg flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-app-border bg-app-surface/95 backdrop-blur-md z-30">
                <button
                    onClick={onClose}
                    className="px-3.5 py-1.5 bg-app-bg border border-app-border rounded-xl text-sm font-semibold text-app-text hover:bg-app-border active:scale-95 transition-all cursor-pointer"
                >
                    Close
                </button>
                <span className="font-extrabold text-lg text-app-text">Barcode Scanner</span>
                <div className="w-16" />
            </div>

            {/* camera viewport container (fills full screen below header) */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                {/* camera video feed */}
                <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    onLoadedData={() => setIsVideoReady(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${isVideoReady ? "opacity-100" : "opacity-0"
                        }`}
                />

                {/* dark viewfinder mask overlay around cutout */}
                {hasCameraPermission !== false && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* target viewfinder box with dynamic guideline colors */}
                        <div
                            className={`relative w-[84%] max-w-sm aspect-[1.75/1] rounded-3xl transition-all duration-300 ${scanSuccess
                                ? "bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.7)] scale-105"
                                : "shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                                }`}
                        >
                            {/* guideline corner accents shift from brand (orange) to emerald green on detection */}
                            <div
                                className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-3xl transition-colors duration-300 ${scanSuccess ? "border-emerald-400" : "border-brand"
                                    }`}
                            />
                            <div
                                className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-3xl transition-colors duration-300 ${scanSuccess ? "border-emerald-400" : "border-brand"
                                    }`}
                            />
                            <div
                                className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-3xl transition-colors duration-300 ${scanSuccess ? "border-emerald-400" : "border-brand"
                                    }`}
                            />
                            <div
                                className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-3xl transition-colors duration-300 ${scanSuccess ? "border-emerald-400" : "border-brand"
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {/* floating action controls overlay over camera, top left status pill & top right buttons */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                    {/* mode / status tag */}
                    <div
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors shadow-md ${scanSuccess
                            ? "bg-emerald-500/90 border-emerald-400 text-white"
                            : "bg-black/70 border-white/10 text-white"
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${scanSuccess ? "bg-white animate-ping" : "bg-brand animate-pulse"
                                }`}
                        />
                        {scanSuccess ? "Barcode Detected!" : "Scanning..."}
                    </div>

                    {/* floating action buttons */}
                    <div className="flex items-center gap-2">
                        {/* zoom button (if available) */}
                        {hasZoom && (
                            <button
                                onClick={toggleZoom}
                                title="Toggle Camera Zoom"
                                className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-bold transition-colors cursor-pointer shadow-md active:scale-90 ${zoomLevel > 1
                                    ? "bg-brand border-brand text-white"
                                    : "bg-black/70 border-white/10 text-white hover:bg-black/85"
                                    }`}
                            >
                                {zoomLevel > 1 ? `${zoomLevel}x` : "1x"}
                            </button>
                        )}

                        {/* torch/flashlight button (if available) */}
                        {hasTorch && (
                            <button
                                onClick={toggleTorch}
                                title="Toggle Flashlight"
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors cursor-pointer shadow-md active:scale-90 ${torchOn
                                    ? "bg-brand border-brand text-white"
                                    : "bg-black/70 border-white/10 text-white hover:bg-black/85"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                        )}

                        {/* manual barcode entry button */}
                        <button
                            onClick={() => setIsManualInputOpen(true)}
                            title="Enter Barcode Manually"
                            className="w-10 h-10 rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/85 flex items-center justify-center transition-colors cursor-pointer shadow-md active:scale-90"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M7 18h10M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* loading overlay */}
                {isLoading && !scanSuccess && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white z-40">
                        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mb-3" />
                        <span className="font-bold text-base">Fetching OpenFoodFacts data...</span>
                    </div>
                )}

                {/* error banner */}
                {errorMessage && (
                    <div className="absolute bottom-6 inset-x-6 bg-red-950/90 border border-red-500/40 backdrop-blur-md rounded-2xl p-4 text-center z-30 shadow-2xl flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-red-200">{errorMessage}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 active:scale-95 transition-all cursor-pointer"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => {
                                    setErrorMessage(null);
                                    setIsManualInputOpen(true);
                                }}
                                className="px-4 py-1.5 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                            >
                                Enter Manually
                            </button>
                        </div>
                    </div>
                )}

                {/* camera permission / error view */}
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 bg-app-surface flex flex-col items-center justify-center p-6 text-center z-30">
                        <span className="text-4xl mb-3">📷</span>
                        <span className="font-extrabold text-app-text text-base mb-1">Camera Access Required</span>
                        {cameraErrorDetail ? (
                            <span className="text-xs text-red-400 font-medium my-3 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20 max-w-sm">
                                {cameraErrorDetail}
                            </span>
                        ) : (
                            <span className="text-xs text-app-muted mb-4 max-w-xs">
                                Grant camera permissions to scan live barcodes, or use manual lookup.
                            </span>
                        )}
                        <button
                            onClick={() => setIsManualInputOpen(true)}
                            className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand/90 active:scale-95 transition-all cursor-pointer shadow-md"
                        >
                            Enter Barcode Manually
                        </button>
                    </div>
                )}
            </div>

            {/* floating manual barcode entry dialog / drawer */}
            <AnimatePresence>
                {isManualInputOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-app-surface border border-app-border rounded-3xl p-5 shadow-2xl flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-base text-app-text">Enter Barcode</span>
                                <button
                                    onClick={() => setIsManualInputOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-app-bg border border-app-border text-app-muted hover:text-app-text font-bold text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoFocus
                                    value={manualBarcode}
                                    onChange={(e) => setManualBarcode(e.target.value)}
                                    placeholder="e.g. 0737628064502 or 3017620422003"
                                    className="w-full p-3.5 bg-app-bg border border-app-border rounded-2xl text-app-text placeholder-app-muted focus:outline-none focus:border-brand text-base font-medium tracking-wide"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsManualInputOpen(false)}
                                        className="flex-1 py-3 bg-app-bg border border-app-border rounded-xl font-bold text-xs text-app-text hover:bg-app-border active:scale-95 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!manualBarcode.trim() || isLoading}
                                        className="flex-1 py-3 bg-brand text-white rounded-xl font-bold text-xs hover:bg-brand/90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                                    >
                                        Lookup Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}