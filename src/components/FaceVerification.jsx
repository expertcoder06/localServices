import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { loadModels, detectFace, isBlinking, isSmiling, checkHeadMovement } from '../utils/faceService';

const FaceVerification = ({ onVerified, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('loading'); // 'loading', 'ready', 'verifying', 'success', 'failed'
    const [prompt, setPrompt] = useState('Loading models...');
    const [liveness, setLiveness] = useState({
        blink: false,
        headMove: false,
        smile: false
    });
    const [attempts, setAttempts] = useState(0);
    const maxAttempts = 3;
    const initialNoseX = useRef(null);

    useEffect(() => {
        const initModels = async () => {
            await loadModels();
            setStatus('ready');
            setPrompt('Allow camera access to start verification');
            startVideo();
        };
        initModels();
        return () => stopVideo();
    }, []);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setPrompt('Look at the camera and keep your face within the frame.');
            }
        } catch (err) {
            console.error(err);
            setPrompt('Camera access denied. Please enable camera permissions.');
            setStatus('failed');
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const handleVerify = async () => {
        if (status !== 'ready') return;
        setStatus('verifying');
        setPrompt('Detecting face...');
        
        // Start verification loop with faster interval (200ms) for blink detection
        const intervalId = setInterval(async () => {
            if (!videoRef.current) return;
            
            // Use TinyFaceDetector for faster real-time processing
            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions()
                .withFaceDescriptor();
            
            if (detection) {
                const landmarks = detection.landmarks;
                
                // Set initial nose position if not set
                if (initialNoseX.current === null) {
                    initialNoseX.current = landmarks.getNose()[3].x;
                }

                // Liveness checks
                if (!liveness.blink && isBlinking(landmarks)) {
                    setLiveness(prev => ({ ...prev, blink: true }));
                    setPrompt('Blink detected! Now, turn your head slightly left or right.');
                }
                
                else if (liveness.blink && !liveness.headMove && checkHeadMovement(landmarks, initialNoseX.current)) {
                    setLiveness(prev => ({ ...prev, headMove: true }));
                    setPrompt('Movement detected! Now, give us a smile.');
                }

                else if (liveness.headMove && !liveness.smile && isSmiling(landmarks)) {
                    setLiveness(prev => ({ ...prev, smile: true }));
                    setPrompt('Verification successful! Syncing data...');
                    clearInterval(intervalId);
                    completeVerification(detection);
                }
            } else {
                setPrompt('Keep your face steady and within the frame.');
            }
        }, 200);

    };

    const completeVerification = (detection) => {
        setStatus('success');
        setPrompt('Identity Verified Successfully');
        
        // Capture a frame from video
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        const photoBlob = canvas.toDataURL('image/jpeg');

        onVerified({
            embedding: Array.from(detection.descriptor),
            photo: photoBlob
        });
    };

    const resetVerification = () => {
        if (attempts >= maxAttempts) {
            setPrompt('Maximum attempts reached. Please contact support.');
            return;
        }
        setAttempts(prev => prev + 1);
        setLiveness({ blink: false, headMove: false, smile: false });
        initialNoseX.current = null;
        setStatus('ready');
        setPrompt('Try again. Keep your face centered.');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)'
        }}>
            <div className="glass-card" style={{
                width: '100%', maxWidth: '500px', padding: '2rem',
                textAlign: 'center', position: 'relative'
            }}>
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <video ref={videoRef} autoPlay muted playsInline style={{
                        width: '100%', borderRadius: 'var(--radius-md)',
                        transform: 'scaleX(-1)', // Mirror effect
                        border: `4px solid ${status === 'success' ? '#10b981' : (status === 'verifying' ? 'var(--primary)' : 'var(--outline)')}`,
                        background: '#000'
                    }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ opacity: liveness.blink ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                            <CheckCircle size={20} color="#10b981" />
                            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Blink</p>
                        </div>
                        <div style={{ opacity: liveness.headMove ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                            <CheckCircle size={20} color="#10b981" />
                            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Move Head</p>
                        </div>
                        <div style={{ opacity: liveness.smile ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                            <CheckCircle size={20} color="#10b981" />
                            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Smile</p>
                        </div>
                    </div>
                </div>

                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>{status === 'success' ? 'Verified' : 'Verification Steps'}</h3>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', minHeight: '3rem' }}>{prompt}</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {status === 'ready' && (
                        <button onClick={handleVerify} className="btn-primary" style={{ flex: 1, padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Camera size={20} /> Start Scanning
                        </button>
                    )}
                    
                    {status === 'verifying' && (
                        <div style={{ flex: 1, padding: '1rem', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <RefreshCw className="spin" size={20} /> Processing...
                        </div>
                    )}

                    {status === 'failed' && (
                        <button onClick={resetVerification} className="btn-secondary" style={{ flex: 1, padding: '1rem', background: 'var(--error)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                            Retry Attempt ({attempts}/{maxAttempts})
                        </button>
                    )}

                    {status === 'success' && (
                        <div style={{ flex: 1, padding: '1rem', background: '#10b981', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <UserCheck size={20} /> Verification Complete
                        </div>
                    )}
                </div>

                <button onClick={onCancel} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--secondary)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Cancel & Go Back
                </button>
            </div>
        </div>
    );
};

export default FaceVerification;
