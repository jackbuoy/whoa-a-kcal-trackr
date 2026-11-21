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
    const [isVideoReady, setIsVideoReady] = useState(false);

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
            mediaStreamRef.current.getVideoTracks().forEach((track) => {
                try {
                    const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
                    if (capabilities.torch) {
                        track.applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet] }).catch(() => { });
                    }
                } catch (e) {
                    // ignore
                }
            });
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsVideoReady(false);
    }, []);

    const handleBarcodeDetected = useCallback(async (barcode: string) => {
        if (isLoadingRef.current || scanSuccessRef.current) return;

        setScanSuccess(true);
        setIsLoading(true);
        setErrorMessage(null);

        await new Promise((resolve) => setTimeout(resolve, 350));

        stopAllStreams();

        const food = await fetchFoodByBarcode(barcode);
        setIsLoading(false);

        if (food) {
            onFoodFound(food);
            onClose();
        } else {
            setScanSuccess(false);
            setErrorMessage(`No product found for barcode: ${barcode}. Try entering details manually.`);
        }
    }, [onFoodFound, onClose, stopAllStreams]);

    const toggleTorch = useCallback(async () => {
        const stream = mediaStreamRef.current;
        if (!stream) return;
        const track = stream.getVideoTracks()[0];
        if (!track) return;

        try {
            const nextState = !torchOn;
            await track.applyConstraints({
                advanced: [{ torch: nextState } as MediaTrackConstraintSet],
            });
            setTorchOn(nextState);
        } catch (e) {
            console.warn("Flashlight constraint error:", e);
        }
    }, [torchOn]);

    const toggleZoom = useCallback(async () => {
        const stream = mediaStreamRef.current;
        if (!stream) return;
        const track = stream.getVideoTracks()[0];
        if (!track) return;

        try {
            const nextZoom = zoomLevel >= zoomMax ? 1 : Math.min(zoomLevel + 1, zoomMax);
            await track.applyConstraints({
                advanced: [{ zoom: nextZoom } as MediaTrackConstraintSet],
            });
            setZoomLevel(nextZoom);
        } catch (e) {
            console.warn("Zoom constraint error:", e);
        }
    }, [zoomLevel, zoomMax]);

    useEffect(() => {
        let isMounted = true;
        let nativeLoopTimer: ReturnType<typeof setTimeout> | null = null;

        const startNativeScanner = async (
            BarcodeDetectorClass: new (opts?: { formats: string[] }) => {
                detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
            }
        ) => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            if (!isMounted) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }

            mediaStreamRef.current = stream;
            const videoTrack = stream.getVideoTracks()[0];
            const capabilities = (videoTrack?.getCapabilities?.() || {}) as {
                torch?: boolean;
                zoom?: { min: number; max: number };
            };
            setHasTorch(Boolean(capabilities.torch));
            if (capabilities.zoom) {
                setHasZoom(true);
                setZoomMax(Math.min(capabilities.zoom.max, 4));
            }
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => { });
            }

            const detector = new BarcodeDetectorClass({
                formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
            });

            const scanFrame = async () => {
                if (!isMounted || isLoadingRef.current || scanSuccessRef.current) return;
                const video = videoRef.current;

                if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                    nativeLoopTimer = setTimeout(scanFrame, NATIVE_DETECT_RETRY_MS);
                    return;
                }

                try {
                    const barcodes = await detector.detect(video);
                    if (barcodes.length > 0 && barcodes[0].rawValue) {
                        handleBarcodeDetected(barcodes[0].rawValue);
                        return;
                    }
                } catch (e) {
                    // Frame detection dropped, retry on next tick
                }

                nativeLoopTimer = setTimeout(scanFrame, NATIVE_DETECT_INTERVAL_MS);
            };

            nativeLoopTimer = setTimeout(scanFrame, 200);
        };

        const startZxingScanner = async () => {
            const hints = new Map<DecodeHintType, unknown>();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.CODE_128,
            ]);
            hints.set(DecodeHintType.TRY_HARDER, true);

            const zxingReader = new BrowserMultiFormatReader(hints, 200);
            readerRef.current = zxingReader;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            if (!isMounted) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }

            mediaStreamRef.current = stream;
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => { });
            }

            await zxingReader.decodeFromVideoElementContinuously(videoRef.current!, (result) => {
                if (!isMounted) return;
                if (result && !isLoadingRef.current && !scanSuccessRef.current) {
                    handleBarcodeDetected(result.getText());
                }
            });
        };

        const startScanner = async () => {
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
                    await startNativeScanner(BarcodeDetectorClass);
                } else {
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
    }, [stopAllStreams, handleBarcodeDetected]);

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
            className="absolute inset-0 z-30 bg-app-bg flex flex-col overflow-hidden"
        >
            {/* Header: bounded cleanly inside workspace, stops right below the navbar */}
            <div className="flex-none shrink-0 flex items-center justify-between px-4 py-3 border-b border-app-separator bg-app-bg z-30">
                <button
                    onClick={onClose}
                    className="h-8 px-3.5 bg-app-surface-raised active:bg-white/15 border border-app-separator rounded-full text-[13px] font-semibold text-app-text active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    aria-label="Close barcode scanner"
                >
                    ✕ Close
                </button>
                <span className="font-semibold text-sm text-app-text">Scan Barcode</span>
                <button
                    onClick={() => setIsManualInputOpen(true)}
                    className="h-8 px-3.5 bg-app-surface-raised active:bg-white/15 border border-app-separator rounded-full text-xs font-semibold text-app-muted active:text-app-text transition-all cursor-pointer"
                >
                    Manual
                </button>
            </div>

            {/* camera viewport container */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
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
                        <div
                            className={`relative w-[84%] max-w-sm aspect-[1.75/1] rounded-3xl transition-all duration-300 ${scanSuccess
                                ? "bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.7)] scale-105"
                                : "shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                                }`}
                        >
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

                {/* floating action controls overlay over camera */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                    <div
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors shadow-sm ${scanSuccess
                            ? "bg-emerald-500/90 border-emerald-400 text-white"
                            : "bg-app-surface-raised/90 border-app-separator text-app-text backdrop-blur-md"
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${scanSuccess ? "bg-white animate-ping" : "bg-brand animate-pulse"
                                }`}
                        />
                        {scanSuccess ? "Barcode Detected!" : "Scanning..."}
                    </div>

                    <div className="flex items-center gap-2">
                        {hasZoom && (
                            <button
                                onClick={toggleZoom}
                                title="Toggle Camera Zoom"
                                className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-90 ${zoomLevel > 1
                                    ? "bg-brand border-brand text-white"
                                    : "bg-app-surface-raised/90 border-app-separator text-app-text backdrop-blur-md"
                                    }`}
                            >
                                {zoomLevel > 1 ? `${zoomLevel}x` : "1x"}
                            </button>
                        )}

                        {hasTorch && (
                            <button
                                onClick={toggleTorch}
                                title="Toggle Flashlight"
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors cursor-pointer shadow-sm active:scale-90 ${torchOn
                                    ? "bg-brand border-brand text-white"
                                    : "bg-app-surface-raised/90 border-app-separator text-app-text backdrop-blur-md"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                        )}

                        <button
                            onClick={() => setIsManualInputOpen(true)}
                            title="Enter Barcode Manually"
                            className="w-10 h-10 rounded-full bg-app-surface-raised/90 border border-app-separator text-app-text flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-90 backdrop-blur-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M7 18h10M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* loading overlay */}
                {isLoading && !scanSuccess && (
                    <div className="absolute inset-0 bg-app-bg/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-app-text z-40">
                        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mb-3" />
                        <span className="font-semibold text-sm">Fetching food data...</span>
                    </div>
                )}

                {/* error banner */}
                {errorMessage && (
                    <div className="absolute bottom-6 inset-x-6 bg-rose-950/90 border border-rose-500/40 backdrop-blur-md rounded-2xl p-4 text-center z-30 shadow-2xl flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-rose-200">{errorMessage}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500 active:scale-95 transition-all cursor-pointer"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => {
                                    setErrorMessage(null);
                                    setIsManualInputOpen(true);
                                }}
                                className="px-4 py-1.5 bg-app-surface-raised text-app-text border border-app-separator rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
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
                        <span className="font-bold text-app-text text-base mb-1">Camera Access Required</span>
                        {cameraErrorDetail ? (
                            <span className="text-xs text-rose-400 font-medium my-3 px-3 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20 max-w-sm">
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

            {/* floating manual barcode entry dialog */}
            <AnimatePresence>
                {isManualInputOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-app-surface border border-app-separator rounded-3xl p-5 shadow-2xl flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-base text-app-text">Enter Barcode</span>
                                <button
                                    onClick={() => setIsManualInputOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-app-surface-raised text-app-muted hover:text-app-text font-bold text-xs"
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
                                    className="w-full p-3.5 bg-app-bg border border-app-separator rounded-2xl text-app-text placeholder-app-muted focus:outline-none focus:border-brand text-base font-medium tracking-wide"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsManualInputOpen(false)}
                                        className="flex-1 py-3 bg-app-surface-raised border border-app-separator rounded-2xl font-semibold text-xs text-app-text active:scale-95 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!manualBarcode.trim() || isLoading}
                                        className="flex-1 py-3 bg-brand text-white rounded-2xl font-bold text-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-brand/20"
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
