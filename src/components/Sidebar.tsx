import { type RefObject, useRef } from 'react'
import { Canvas as FabricCanvas, FabricImage, FabricText, Rect, Circle, Triangle } from 'fabric'
import { Upload, Type, Square, CircleIcon, TriangleIcon } from 'lucide-react'

interface Props {
  canvasRef: RefObject<FabricCanvas | null>
}

export default function Sidebar({ canvasRef }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = () => fileInputRef.current?.click()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canvasRef.current) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const imgEl = new Image()
      imgEl.onload = () => {
        const fImg = new FabricImage(imgEl)
        fImg.scaleToWidth(200)
        canvasRef.current!.add(fImg)
        canvasRef.current!.setActiveObject(fImg)
        canvasRef.current!.requestRenderAll()
      }
      imgEl.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const addText = () => {
    if (!canvasRef.current) return
    const text = new FabricText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#ffffff',
    })
    canvasRef.current.add(text)
    canvasRef.current.setActiveObject(text)
    canvasRef.current.requestRenderAll()
  }

  const addShape = (shape: 'rect' | 'circle' | 'triangle') => {
    if (!canvasRef.current) return
    const opts = { left: 100, top: 100, fill: '#3b82f6', width: 100, height: 100 }
    let obj
    switch (shape) {
      case 'rect':
        obj = new Rect(opts)
        break
      case 'circle':
        obj = new Circle({ ...opts, radius: 50 })
        break
      case 'triangle':
        obj = new Triangle(opts)
        break
    }
    canvasRef.current.add(obj)
    canvasRef.current.setActiveObject(obj)
    canvasRef.current.requestRenderAll()
  }

  return (
    <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-4">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <ToolButton icon={<Upload size={20} />} label="Upload" onClick={handleUpload} />
      <ToolButton icon={<Type size={20} />} label="Text" onClick={addText} />
      <div className="w-8 h-px bg-gray-600" />
      <ToolButton icon={<Square size={20} />} label="Rect" onClick={() => addShape('rect')} />
      <ToolButton icon={<CircleIcon size={20} />} label="Circle" onClick={() => addShape('circle')} />
      <ToolButton icon={<TriangleIcon size={20} />} label="Triangle" onClick={() => addShape('triangle')} />
    </div>
  )
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
    >
      {icon}
    </button>
  )
}
