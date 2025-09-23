import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  middlePanel: React.ReactNode;
  rightPanel: React.ReactNode;
  minPanelWidth?: number;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  leftPanel,
  middlePanel,
  rightPanel,
  minPanelWidth = 250,
}) => {
  const { state, setPanelSizes } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartSizes, setDragStartSizes] = useState(state.panelSizes);

  const handleMouseDown = useCallback((divider: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(divider);
    setDragStartX(e.clientX);
    setDragStartSizes(state.panelSizes);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [state.panelSizes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const deltaX = e.clientX - dragStartX;

    if (isDragging === 'left') {
      // Resizing left panel
      const newLeftWidth = Math.max(
        minPanelWidth,
        Math.min(
          containerWidth - minPanelWidth * 2, // Ensure space for other panels
          dragStartSizes.left + deltaX
        )
      );
      
      const remainingWidth = containerWidth - newLeftWidth;
      const middleRatio = dragStartSizes.middle / (dragStartSizes.middle + dragStartSizes.right);
      const newMiddleWidth = Math.max(minPanelWidth, remainingWidth * middleRatio);
      const newRightWidth = remainingWidth - newMiddleWidth;

      if (newRightWidth >= minPanelWidth) {
        setPanelSizes({
          left: newLeftWidth,
          middle: newMiddleWidth,
          right: newRightWidth,
        });
      }
    } else if (isDragging === 'right') {
      // Resizing middle panel (right divider)
      const totalLeftMiddle = dragStartSizes.left + dragStartSizes.middle;
      const newMiddleWidth = Math.max(
        minPanelWidth,
        Math.min(
          containerWidth - dragStartSizes.left - minPanelWidth, // Ensure space for right panel
          dragStartSizes.middle + deltaX
        )
      );
      
      const newRightWidth = containerWidth - dragStartSizes.left - newMiddleWidth;

      if (newRightWidth >= minPanelWidth) {
        setPanelSizes({
          left: dragStartSizes.left,
          middle: newMiddleWidth,
          right: newRightWidth,
        });
      }
    }
  }, [isDragging, dragStartX, dragStartSizes, minPanelWidth, setPanelSizes]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle window resize to maintain proportions
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const currentTotal = state.panelSizes.left + state.panelSizes.middle + state.panelSizes.right;
      
      if (Math.abs(currentTotal - containerWidth) > 10) {
        // Recalculate sizes proportionally
        const leftRatio = state.panelSizes.left / currentTotal;
        const middleRatio = state.panelSizes.middle / currentTotal;
        const rightRatio = state.panelSizes.right / currentTotal;
        
        setPanelSizes({
          left: Math.max(minPanelWidth, containerWidth * leftRatio),
          middle: Math.max(minPanelWidth, containerWidth * middleRatio),
          right: Math.max(minPanelWidth, containerWidth * rightRatio),
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.panelSizes, minPanelWidth, setPanelSizes]);

  return (
    <div 
      ref={containerRef}
      className="flex h-full overflow-hidden"
      style={{ 
        cursor: isDragging ? 'col-resize' : 'default',
      }}
    >
      {/* Left Panel */}
      <div 
        className="flex-shrink-0 overflow-hidden"
        style={{ width: `${state.panelSizes.left}px` }}
      >
        {leftPanel}
      </div>

      {/* Left Divider */}
      <div
        className={`panel-divider w-1 bg-transparent hover:bg-indigo-500/20 transition-all duration-200 ${
          isDragging === 'left' ? 'bg-indigo-500/30 dragging' : ''
        }`}
        onMouseDown={(e) => handleMouseDown('left', e)}
      />

      {/* Middle Panel */}
      <div 
        className="flex-shrink-0 overflow-hidden"
        style={{ width: `${state.panelSizes.middle}px` }}
      >
        {middlePanel}
      </div>

      {/* Right Divider */}
      <div
        className={`panel-divider w-1 bg-transparent hover:bg-indigo-500/20 transition-all duration-200 ${
          isDragging === 'right' ? 'bg-indigo-500/30 dragging' : ''
        }`}
        onMouseDown={(e) => handleMouseDown('right', e)}
      />

      {/* Right Panel */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ minWidth: `${minPanelWidth}px` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};