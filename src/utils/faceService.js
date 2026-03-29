import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

export const loadModels = async () => {
    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        ]);
    } catch (error) {
        console.error("Error loading face-api models:", error);
    }
};

export const detectFace = async (source) => {
    // source can be video or image element
    return await faceapi
        .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();
};

export const extractEmbeddingFromImage = async (imageElement) => {
    const detection = await detectFace(imageElement);
    return detection ? Array.from(detection.descriptor) : null;
};


export const getFingerprint = (descriptor) => {
    return Array.from(descriptor);
};

export const calculateSimilarity = (embedding1, embedding2) => {
    if (!embedding1 || !embedding2) return 0;
    const distance = faceapi.euclideanDistance(embedding1, embedding2);
    // Convert Euclidean distance (0 is perfect match) to similarity score (0 to 100)
    // Face descriptors distances are usually < 0.6 for a match
    const threshold = 0.6;
    const similarity = Math.max(0, 1 - (distance / threshold)) * 100;
    return similarity;
};

// Liveness detection helper functions
export const isBlinking = (landmarks) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const getEAR = (eye) => {
        const p1 = eye[0], p2 = eye[1], p3 = eye[2], p4 = eye[3], p5 = eye[4], p6 = eye[5];
        const dist1 = faceapi.euclideanDistance([p2.x, p2.y], [p6.x, p6.y]);
        const dist2 = faceapi.euclideanDistance([p3.x, p3.y], [p5.x, p5.y]);
        const dist3 = faceapi.euclideanDistance([p1.x, p1.y], [p4.x, p4.y]);
        return (dist1 + dist2) / (2.0 * dist3);
    };

    const earL = getEAR(leftEye);
    const earR = getEAR(rightEye);
    
    // Low EAR usually means eyes are closed/blinking
    // Increasng threshold slightly to 0.23 for better sensitivity
    return (earL + earR) / 2 < 0.23;
};

export const isSmiling = (landmarks) => {
    const mouth = landmarks.getMouth();
    // Mouth width vs mouth height
    const left = mouth[0], right = mouth[6], top = mouth[3], bottom = mouth[9];
    const width = faceapi.euclideanDistance([left.x, left.y], [right.x, right.y]);
    const height = faceapi.euclideanDistance([top.x, top.y], [bottom.x, bottom.y]);
    // More sensitive smile detection (0.3 instead of 0.4)
    return (height / width) > 0.25;
};


export const checkHeadMovement = (landmarks, initialNoseX) => {
    const nose = landmarks.getNose();
    const currentNoseX = nose[3].x; // Middle of nose
    const diff = currentNoseX - initialNoseX;
    return Math.abs(diff) > 20; // significant horizontal movement
};
