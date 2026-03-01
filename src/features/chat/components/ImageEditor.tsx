import React, { useRef, useState, useEffect } from "react";
import { 
  X, 
  Check, 
  RotateCw, 
  Type, 
  Square, 
  Circle, 
  Pen, 
  Crop,
  Undo2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

interface Annotation {
  type: "DRAW" | "TEXT" | "SHAPE" | "CIRCLE";
  points?: { x: number, y: number }[];
  x?: number;
  y?: number;
  text?: string;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [mode, setMode] = useState<"NONE" | "DRAW" | "TEXT" | "SHAPE" | "CIRCLE" | "CROP">("NONE");
  const [color, setColor] = useState("#3b82f6");
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [cropBox, setCropBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [selectedTextIdx, setSelectedTextIdx] = useState<number | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => setImageObj(img);
  }, [imageSrc]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas size
    if (rotation % 180 === 0) {
      canvas.width = imageObj.width;
      canvas.height = imageObj.height;
    } else {
      canvas.width = imageObj.height;
      canvas.height = imageObj.width;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Base Image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2);
    ctx.restore();

    // Draw Annotations
    annotations.forEach(renderAnnotation);
    if (currentAnnotation) renderAnnotation(currentAnnotation);
    
    // Draw Crop Box
    if (mode === "CROP" && cropBox) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
        ctx.setLineDash([]);
        // Overlay
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, cropBox.y);
        ctx.fillRect(0, cropBox.y + cropBox.h, canvas.width, canvas.height - (cropBox.y + cropBox.h));
        ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
        ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, canvas.width - (cropBox.x + cropBox.w), cropBox.h);
    }
  };

  const renderAnnotation = (ann: Annotation) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    if (ann.type === "DRAW" && ann.points) {
      ctx.beginPath();
      ann.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (ann.type === "SHAPE") {
      ctx.strokeRect(ann.x!, ann.y!, ann.width!, ann.height!);
    } else if (ann.type === "CIRCLE") {
      ctx.beginPath();
      ctx.arc(ann.x!, ann.y!, ann.radius!, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (ann.type === "TEXT") {
      ctx.font = "bold 60px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ann.text!, ann.x!, ann.y!);
    }
  };

  useEffect(() => { redraw(); }, [imageObj, rotation, annotations, currentAnnotation, mode, cropBox]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (mode === "TEXT") {
      const existingTextIdx = annotations.findIndex(a => a.type === "TEXT" && Math.abs(a.x! - x) < 50 && Math.abs(a.y! - y) < 50);
      if (existingTextIdx > -1) {
          setSelectedTextIdx(existingTextIdx);
          return;
      }
      const text = prompt("Signal Content:");
      if (text) {
        setHistory([...history.slice(-19), annotations]);
        setAnnotations([...annotations, { type: "TEXT", x, y, text, color }]);
      }
      return;
    }

    if (mode === "CROP") {
        setCropBox({ x, y, w: 0, h: 0 });
    } else if (mode !== "NONE") {
        setHistory([...history.slice(-19), annotations]);
        setCurrentAnnotation({ type: mode, points: [{ x, y }], x, y, color, width: 0, height: 0, radius: 0 });
    }
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing && selectedTextIdx === null && mode !== "CROP") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (selectedTextIdx !== null) {
        const newAnns = [...annotations];
        newAnns[selectedTextIdx] = { ...newAnns[selectedTextIdx], x, y };
        setAnnotations(newAnns);
        return;
    }

    if (isDrawing) {
        if (mode === "CROP" && cropBox) {
            setCropBox(prev => ({ ...prev!, w: x - prev!.x, h: y - prev!.y }));
        } else if (currentAnnotation) {
            const up = { ...currentAnnotation };
            if (mode === "DRAW") up.points = [...up.points!, { x, y }];
            else {
                up.width = x - up.x!;
                up.height = y - up.y!;
                up.radius = Math.sqrt(Math.pow(x - up.x!, 2) + Math.pow(y - up.y!, 2));
            }
            setCurrentAnnotation(up);
        }
    }
  };

  const handleMouseUp = () => {
    if (currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }
    setIsDrawing(false);
    setSelectedTextIdx(null);
  };

  const performCrop = () => {
    if (!cropBox || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Create temp canvas for crop result
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.abs(cropBox.w);
    tempCanvas.height = Math.abs(cropBox.h);
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const sx = cropBox.w > 0 ? cropBox.x : cropBox.x + cropBox.w;
    const sy = cropBox.h > 0 ? cropBox.y : cropBox.y + cropBox.h;

    tempCtx.drawImage(canvas, sx, sy, tempCanvas.width, tempCanvas.height, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const newImg = new Image();
    newImg.src = tempCanvas.toDataURL();
    newImg.onload = () => {
        setImageObj(newImg);
        setAnnotations([]);
        setHistory([]);
        setCropBox(null);
        setRotation(0);
        setMode("NONE");
    };
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setAnnotations(last);
    setHistory(history.slice(0, -1));
  };

  const clearAll = () => {
      setHistory([...history.slice(-19), annotations]);
      setAnnotations([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.toBlob(blob => blob && onSave(blob), "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onCancel}>
          <X size={24} />
        </Button>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={clearAll} title="Clear All">
              <Trash2 size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={undo} disabled={history.length <= 1}>
              <Undo2 size={20} />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 gap-2 font-bold" onClick={handleSave}>
              <Check size={18} /> Done
            </Button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-10 bg-slate-900 group">
        <canvas 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`max-w-full max-h-full shadow-2xl transition-all duration-300 shadow-black/50 ${mode !== "NONE" ? 'cursor-crosshair' : 'cursor-default'} bg-white`}
        />
      </div>

      {/* Toolbar */}
      <footer className="p-6 bg-black/80 backdrop-blur-xl border-t border-white/10 flex flex-col gap-6">
        <div className="flex justify-center gap-4 overflow-x-auto pb-2 no-scrollbar px-4">
            {[
                { id: "CROP", icon: <Crop size={20} />, label: "Crop" },
                { id: "DRAW", icon: <Pen size={20} />, label: "Draw" },
                { id: "SHAPE", icon: <Square size={20} />, label: "Square" },
                { id: "CIRCLE", icon: <Circle size={20} />, label: "Circle" },
                { id: "TEXT", icon: <Type size={20} />, label: "Text" },
                { id: "ROTATE", icon: <RotateCw size={20} />, label: "Rotate", onClick: () => setRotation(r => (r + 90) % 360) },
            ].map(tool => (
                <button
                    key={tool.id}
                    onClick={() => {
                        if (tool.onClick) tool.onClick();
                        else setMode(tool.id as any);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 min-w-[64px] rounded-2xl transition-all active:scale-95 ${mode === tool.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    {tool.icon}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tool.label}</span>
                </button>
            ))}
        </div>

        {/* Action Bar for Tools */}
        {mode === "CROP" && cropBox && Math.abs(cropBox.w) > 10 && (
            <div className="flex justify-center animate-in slide-in-from-bottom-2">
                <Button onClick={performCrop} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 font-black uppercase tracking-widest text-[10px]">
                    Cut Transmission
                </Button>
            </div>
        )}

        {/* Colors (if editing) */}
        {mode !== "NONE" && mode !== "ROTATE" as any && mode !== "CROP" && (
            <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-2">
                {["#000000", "#ffffff", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"].map(c => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`h-9 w-9 rounded-full border-2 transition-all ${color === c ? 'border-white scale-125' : 'border-white/20 hover:border-white/40 shadow-inner'}`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        )}
      </footer>
    </div>
  );
};

export default ImageEditor;
