import { useRef, useState, useEffect, useCallback } from "react";

export default function VideoPlayer() {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [sliderX, setSliderX] = useState(() => window.innerWidth * 0.75);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [activeLayer, setActiveLayer] = useState(null);
  const [video1Src, setVideo1Src] = useState(null);
  const [video2Src, setVideo2Src] = useState(null);

  const handleKeyDown = useCallback((event) => {
    if (!videoRef1.current || !videoRef2.current) return;

    switch (event.code) {
      case "Digit1":
        setActiveLayer("video1");
        break;
      case "Digit2":
        setActiveLayer("video2");
        break;
      case "Space":
        event.preventDefault();
        if (activeLayer === "video1") {
          videoRef1.current.paused ? videoRef1.current.play() : videoRef1.current.pause();
        } else if (activeLayer === "video2") {
          videoRef2.current.paused ? videoRef2.current.play() : videoRef2.current.pause();
        } else {
          if (videoRef1.current.paused) {
            videoRef1.current.play();
            videoRef2.current.play();
          } else {
            videoRef1.current.pause();
            videoRef2.current.pause();
          }
        }
        break;
      case "ArrowRight":
        videoRef1.current.currentTime += 5;
        videoRef2.current.currentTime += 5;
        break;
      case "ArrowLeft":
        videoRef1.current.currentTime -= 5;
        videoRef2.current.currentTime -= 5;
        break;
      case "KeyF":
        setScale(1);
        setPosition({ x: 0, y: 0 });
        break;
      default:
        break;
    }
  }, [activeLayer]);

  const handleKeyUp = useCallback((event) => {
    if (event.code === "Digit1" || event.code === "Digit2") {
      setActiveLayer(null);
    }
  }, []);

  const handleWheel = (event) => {
    event.preventDefault();
    setScale((prev) => {
      const next = Math.max(1, prev + event.deltaY * -0.01);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (event) => {
    if (event.target.id === "slider") {
      setIsDraggingSlider(true);
    } else if (scale > 1) {
      setIsPanning(true);
      setStartPan({ x: event.clientX - position.x, y: event.clientY - position.y });
    }
  };

  const handleMouseMove = (event) => {
    if (isDraggingSlider) {
      setSliderX(Math.min(Math.max(event.clientX, 0), window.innerWidth));
    } else if (isPanning) {
      setPosition({ x: event.clientX - startPan.x, y: event.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSlider(false);
  };

  const handleImportVideo = (event, setVideoSrc) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div>
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          overflow: "hidden",
          backgroundColor: "black",
          cursor: isPanning ? "grabbing" : scale > 1 ? "grab" : isDraggingSlider ? "ew-resize" : "default",
        }}
      >
        {video2Src && (
          <video
            ref={videoRef2}
            src={video2Src}
            onClick={(e) => e.preventDefault()}
            controls={false}
            style={{
              position: "absolute",
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              zIndex: 1,
              opacity: activeLayer === "video1" ? 0 : 1,
            }}
          />
        )}
        {video1Src && (
          <video
            ref={videoRef1}
            src={video1Src}
            onClick={(e) => e.preventDefault()}
            controls={false}
            style={{
              position: "absolute",
              clipPath: activeLayer ? "none" : `inset(0 ${100 - (sliderX / window.innerWidth) * 100}% 0 0)`,
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              zIndex: 2,
              opacity: activeLayer === "video2" ? 0 : 1,
            }}
          />
        )}
        {activeLayer && (
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "8px 16px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              borderRadius: "8px",
              fontSize: "1.2rem",
              zIndex: 5,
              pointerEvents: "none"
            }}
          >
            {activeLayer === "video1" ? "Top Video Active" : "Bottom Video Active"}
          </div>
        )}
        <div
          id="slider"
          style={{
            position: "absolute",
            top: 0,
            left: sliderX,
            width: "2px",
            height: "100%",
            backgroundColor: "red",
            zIndex: 3,
            cursor: "ew-resize",
            display: activeLayer ? "none" : "block",
          }}
        />
      </div>
      <div style={{ marginTop: "50px", textAlign: "center" }}>
        <label style={{ margin: "0 20px" }}>
        Import Original Video
          <span style={{ color: "white", marginRight: "10px" }}></span>
          <input type="file" accept="video/*" onChange={(e) => handleImportVideo(e, setVideo1Src)} />
        </label>
        <label style={{ margin: "0 20px" }}>
        Import Edited Video
          <span style={{ color: "white", marginRight: "10px" }}></span>
          <input type="file" accept="video/*" onChange={(e) => handleImportVideo(e, setVideo2Src)} />
        </label>
      </div>
    </div>
  );
}
