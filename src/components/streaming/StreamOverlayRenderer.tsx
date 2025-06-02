import React, { useState, useRef, useEffect } from "react";
import { StreamOverlay } from "@/types/streaming";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Move,
  Eye,
  EyeOff,
  RotateCcw,
  Settings,
  GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreamOverlayRendererProps {
  overlays: StreamOverlay[];
  onUpdateOverlay: (id: string, updates: Partial<StreamOverlay>) => void;
  onDeleteOverlay: (id: string) => void;
  className?: string;
  editMode?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}

interface DragState {
  isDragging: boolean;
  dragId: string | null;
  startPos: { x: number; y: number };
  startOverlayPos: { x: number; y: number };
}

export const StreamOverlayRenderer: React.FC<StreamOverlayRendererProps> = ({
  overlays,
  onUpdateOverlay,
  onDeleteOverlay,
  className,
  editMode = false,
  containerRef,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragId: null,
    startPos: { x: 0, y: 0 },
    startOverlayPos: { x: 0, y: 0 },
  });
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const rendererRef = useRef<HTMLDivElement>(null);

  const getContainerDimensions = () => {
    const container =
      containerRef?.current || rendererRef.current?.parentElement;
    if (container) {
      return {
        width: container.offsetWidth,
        height: container.offsetHeight,
      };
    }
    return { width: 640, height: 360 }; // Fallback dimensions
  };

  const handleMouseDown = (e: React.MouseEvent, overlayId: string) => {
    if (!editMode) return;

    e.preventDefault();
    e.stopPropagation();

    const overlay = overlays.find((o) => o.id === overlayId);
    if (!overlay) return;

    setDragState({
      isDragging: true,
      dragId: overlayId,
      startPos: { x: e.clientX, y: e.clientY },
      startOverlayPos: { x: overlay.position.x, y: overlay.position.y },
    });

    setSelectedOverlay(overlayId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.dragId) return;

    const container = getContainerDimensions();
    const deltaX = e.clientX - dragState.startPos.x;
    const deltaY = e.clientY - dragState.startPos.y;

    // Convert pixel deltas to percentage
    const deltaXPercent = (deltaX / container.width) * 100;
    const deltaYPercent = (deltaY / container.height) * 100;

    const newX = Math.max(
      0,
      Math.min(100, dragState.startOverlayPos.x + deltaXPercent),
    );
    const newY = Math.max(
      0,
      Math.min(100, dragState.startOverlayPos.y + deltaYPercent),
    );

    onUpdateOverlay(dragState.dragId, {
      position: { x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      dragId: null,
      startPos: { x: 0, y: 0 },
      startOverlayPos: { x: 0, y: 0 },
    });
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState.isDragging]);

  const handleOverlayClick = (e: React.MouseEvent, overlayId: string) => {
    if (!editMode) return;
    e.stopPropagation();
    setSelectedOverlay(selectedOverlay === overlayId ? null : overlayId);
  };

  const handleBackgroundClick = () => {
    if (editMode) {
      setSelectedOverlay(null);
    }
  };

  const renderTextOverlay = (overlay: StreamOverlay) => {
    const fontSize = overlay.textStyle?.fontSize || 24;
    const color = overlay.textStyle?.color || "#FFFFFF";
    const fontWeight = overlay.textStyle?.fontWeight || "normal";
    const textShadow =
      overlay.textStyle?.textShadow || "2px 2px 4px rgba(0,0,0,0.8)";

    return (
      <div
        className={cn(
          "absolute pointer-events-auto select-none font-sans whitespace-nowrap",
          editMode &&
            "cursor-move border-2 border-dashed border-transparent hover:border-blue-400",
          selectedOverlay === overlay.id && "border-blue-500 bg-blue-500/10",
        )}
        style={{
          left: `${overlay.position.x}%`,
          top: `${overlay.position.y}%`,
          fontSize: `${fontSize}px`,
          color: color,
          fontWeight: fontWeight,
          textShadow: textShadow,
          zIndex: 10,
        }}
        onMouseDown={(e) => handleMouseDown(e, overlay.id)}
        onClick={(e) => handleOverlayClick(e, overlay.id)}
      >
        {overlay.content}

        {editMode && selectedOverlay === overlay.id && (
          <div className="absolute -top-8 left-0 flex gap-1 bg-black/80 rounded px-2 py-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteOverlay(overlay.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateOverlay(overlay.id, { visible: !overlay.visible });
              }}
            >
              {overlay.visible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderImageOverlay = (overlay: StreamOverlay) => {
    return (
      <div
        className={cn(
          "absolute pointer-events-auto",
          editMode &&
            "cursor-move border-2 border-dashed border-transparent hover:border-blue-400",
          selectedOverlay === overlay.id && "border-blue-500",
        )}
        style={{
          left: `${overlay.position.x}%`,
          top: `${overlay.position.y}%`,
          width: `${overlay.size.width}px`,
          height: `${overlay.size.height}px`,
          zIndex: 10,
        }}
        onMouseDown={(e) => handleMouseDown(e, overlay.id)}
        onClick={(e) => handleOverlayClick(e, overlay.id)}
      >
        <img
          src={overlay.content}
          alt="Stream overlay"
          className="w-full h-full object-contain"
          draggable={false}
        />

        {editMode && selectedOverlay === overlay.id && (
          <>
            <div className="absolute -top-8 left-0 flex gap-1 bg-black/80 rounded px-2 py-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOverlay(overlay.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateOverlay(overlay.id, { visible: !overlay.visible });
                }}
              >
                {overlay.visible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                // Handle resize logic here
              }}
            >
              <GripHorizontal className="w-3 h-3 text-white rotate-45" />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderLogoOverlay = (overlay: StreamOverlay) => {
    return renderImageOverlay(overlay); // Logos are handled the same as images
  };

  const renderOverlay = (overlay: StreamOverlay) => {
    if (!overlay.visible) return null;

    switch (overlay.type) {
      case "text":
        return renderTextOverlay(overlay);
      case "logo":
        return renderLogoOverlay(overlay);
      case "image":
        return renderImageOverlay(overlay);
      default:
        return null;
    }
  };

  return (
    <div
      ref={rendererRef}
      className={cn(
        "absolute inset-0 pointer-events-none",
        editMode && "pointer-events-auto",
        className,
      )}
      onClick={handleBackgroundClick}
      style={{ zIndex: 5 }}
    >
      {overlays.map((overlay) => (
        <React.Fragment key={overlay.id}>
          {renderOverlay(overlay)}
        </React.Fragment>
      ))}

      {/* Edit mode indicator */}
      {editMode && overlays.length > 0 && (
        <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
          Edit Mode: Click overlays to select, drag to move
        </div>
      )}

      {/* Grid overlay for positioning help in edit mode */}
      {editMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      )}
    </div>
  );
};
