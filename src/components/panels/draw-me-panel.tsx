import { useEffect, useRef, useState } from 'react'
import {
	CanvasProps,
	ControlsProps,
	DrawMePanelProps,
} from '../../interfaces/panels/draw-me-panel'

const DrawMePanel: React.FC<DrawMePanelProps> = ({ onCreateComponent }) => {
	const [color, setColor] = useState('#ffffff')
	const [brushSize, setBrushSize] = useState(3)
	const [componentName, setComponentName] = useState('')
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const clearCanvas = () => {
		const ctx = canvasRef.current?.getContext('2d')
		if (ctx) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		}
	}

	const onChangeComponentName = (name: string) => {
		setComponentName(name)
	}

	return (
		<div className='flex flex-col w-full h-1/2 overflow-auto'>
			<div className='cross w-full h-80 mb-5'>
				<Canvas
					color={color}
					brushSize={brushSize}
					canvasRef={canvasRef}
				/>
			</div>
			<Controls
				canvasRef={canvasRef}
				color={color}
				brushSize={brushSize}
				componentName={componentName}
				onColorChange={setColor}
				onBrushSizeChange={setBrushSize}
				onClear={clearCanvas}
				onChangeComponentName={onChangeComponentName}
				onCreateComponent={c => {
					onCreateComponent(c)
					//clear canvas
					clearCanvas()
					//clear component name
					setComponentName('')
				}}
			/>
		</div>
	)
}

const Canvas: React.FC<CanvasProps> = ({ color, brushSize, canvasRef }) => {
	const [drawing, setDrawing] = useState(false)
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

	const resizeCanvas = () => {
		const canvas = canvasRef.current
		if (canvas && context) {
			const savedImageData = context.getImageData(
				0,
				0,
				canvas.width,
				canvas.height
			)
			const parent = canvas.parentElement
			if (parent) {
				canvas.width = parent.clientWidth
				canvas.height = parent.clientHeight
				context.putImageData(savedImageData, 0, 0)
			}
		}
	}

	useEffect(() => {
		const canvas = canvasRef.current
		if (canvas) {
			const parent = canvas.parentElement
			if (parent) {
				canvas.width = parent.clientWidth
				canvas.height = parent.clientHeight
				const ctx = canvas.getContext('2d')
				if (ctx) {
					setContext(ctx)
					ctx.lineJoin = 'round'
					ctx.lineCap = 'round'
				}
			}
			window.addEventListener('resize', resizeCanvas)
			return () => {
				window.removeEventListener('resize', resizeCanvas)
			}
		}
	}, [])

	useEffect(() => {
		if (context) {
			context.strokeStyle = color
			context.lineWidth = brushSize
		}
	}, [color, brushSize, context])

	const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!context) return
		const { offsetX, offsetY } = event.nativeEvent
		context.beginPath()
		context.moveTo(offsetX, offsetY)
		setDrawing(true)
	}

	const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!drawing || !context) return
		const { offsetX, offsetY } = event.nativeEvent
		context.lineTo(offsetX, offsetY)
		context.stroke()
	}

	const stopDrawing = () => {
		if (!context) return
		context.closePath()
		setDrawing(false)
	}

	const clearCanvas = () => {
		if (context && canvasRef.current) {
			context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		}
	}

	return (
		<div className='w-full h-full relative rounded-lg border-2 border-custom-gray-3'>
			<canvas
				ref={canvasRef}
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				style={{ width: '100%', height: '100%', display: 'block' }}
			/>
			<button
				onClick={clearCanvas}
				className='btn btn-square bg-custom-gray-2 hover:bg-custom-gray-3 border-none text-xl'
				style={{ position: 'absolute', top: '10px', right: '10px' }}>
				<span className='icon-[pixelarticons--trash]'></span>
			</button>
		</div>
	)
}

const Controls: React.FC<ControlsProps> = ({
	canvasRef,
	color,
	brushSize,
	componentName,
	onColorChange,
	onBrushSizeChange,
	onChangeComponentName,
	onCreateComponent,
}) => {
	return (
		<div className='controls flex flex-col items-start p-2 bg-custom-gray-2 rounded-md'>
			<div className='flex flex-col gap-5 w-full'>
				<p className='font-medium'>Pencil</p>
				<div className='w-full'>
					<input
						type='range'
						min='1'
						max='5'
						className={`range range-sm`}
						style={{ accentColor: color }}
						value={brushSize}
						onChange={e => onBrushSizeChange(parseInt(e.target.value))}
					/>
					<div className='flex w-full justify-between px-2 text-xs'>
						<span>1</span>
						<span>2</span>
						<span>3</span>
						<span>4</span>
						<span>5</span>
					</div>
				</div>
				<input
					type='color'
					value={color}
					onChange={e => onColorChange(e.target.value)}
				/>
			</div>
			<div className='divider my-1'></div>
			<div className='w-full flex flex-col gap-4'>
				<p className='font-medium'>Component Options</p>
				<input
					type='text'
					placeholder='Component name'
					className='input input-bordered input-sm w-full max-w-xs bg-custom-gray-1'
					value={componentName}
					onChange={e => onChangeComponentName(e.target.value)}
				/>
				<button
					className='btn btn-block btn-sm border-none bg-green-800 hover:bg-green-900'
					onClick={() => {
						if (canvasRef.current) {
							const ctx = canvasRef.current.getContext('2d')
							if (ctx) {
								const canvas = canvasRef.current
								const imageData = ctx.getImageData(
									0,
									0,
									canvas.width,
									canvas.height
								)
								const { data, width, height } = imageData

								let minX = width,
									minY = height,
									maxX = 0,
									maxY = 0

								for (let y = 0; y < height; y++) {
									for (let x = 0; x < width; x++) {
										const index = (y * width + x) * 4
										const alpha = data[index + 3]
										if (alpha > 0) {
											if (x < minX) minX = x
											if (x > maxX) maxX = x
											if (y < minY) minY = y
											if (y > maxY) maxY = y
										}
									}
								}

								const croppedWidth = maxX - minX + 1
								const croppedHeight = maxY - minY + 1

								const croppedCanvas = document.createElement('canvas')
								croppedCanvas.width = croppedWidth
								croppedCanvas.height = croppedHeight
								const croppedCtx = croppedCanvas.getContext('2d')

								if (croppedCtx) {
									croppedCtx.putImageData(
										ctx.getImageData(minX, minY, croppedWidth, croppedHeight),
										0,
										0
									)
									const dataUrl = croppedCanvas.toDataURL()
									onCreateComponent({
										name: componentName,
										categoryId: '1',
										dataUrl,
									})
								}
							}
						}
					}}>
					Create
				</button>
			</div>
		</div>
	)
}

export default DrawMePanel
